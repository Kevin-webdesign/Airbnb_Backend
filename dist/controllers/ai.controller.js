import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { model } from "../config/ai.js";
import prisma from "../config/prisma.js";
// ─── Natural Language Search ──────────────────────────────────────────────────
const searchPrompt = ChatPromptTemplate.fromTemplate(`
You are a search assistant for an Airbnb-like platform.
Extract search filters from the user's natural language query.

User query: {query}

Return a JSON object with these optional fields:
- location: string (city or area mentioned)
- type: one of APARTMENT, HOUSE, VILLA, CABIN (if mentioned)
- guests: number (max guests needed)
- maxPrice: number (maximum price per night in USD)

Return ONLY valid JSON. No explanation. No markdown. Example:
{{"location": "Kigali", "type": "VILLA", "guests": 4, "maxPrice": 300}}

If a field is not mentioned, omit it from the JSON.
`);
const parser = new JsonOutputParser();
const searchChain = searchPrompt.pipe(model).pipe(parser);
export async function naturalLanguageSearch(req, res) {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: "query is required" });
    }
    // Check if query is related to listings
    const validationPrompt = ChatPromptTemplate.fromTemplate(`
You are a query validator for an Airbnb-like platform.
Determine if the user's query is asking for property/listing information or something unrelated.

User query: {query}

Respond with ONLY valid JSON in this format:
{{"isListingQuery": true/false, "reason": "brief explanation"}}

Examples of listing queries: "I need a villa in Kigali", "Show me apartments", "Find me a place for 4 people", "What houses are available?"
Examples of non-listing queries: "What's your name?", "Tell me a joke", "Who is the president?", "What's the weather today?"
`);
    const validationChain = validationPrompt.pipe(model).pipe(new JsonOutputParser());
    const validation = await validationChain.invoke({ query });
    if (!validation.isListingQuery) {
        return res.json({
            query,
            message: "I'm a listing search assistant. Your query seems unrelated to property searches. Please ask me about listings, locations, amenities, or property types.",
            results: [],
            count: 0,
        });
    }
    // Extract filters from natural language using AI
    const filters = await searchChain.invoke({ query });
    // Build Prisma where clause from extracted filters
    const where = {};
    if (filters.location) {
        where["location"] = { contains: filters.location, mode: "insensitive" };
    }
    if (filters.type) {
        where["type"] = filters.type;
    }
    if (filters.guests) {
        where["guests"] = { gte: filters.guests };
    }
    if (filters.maxPrice) {
        where["pricePerNight"] = { lte: filters.maxPrice };
    }
    const listings = await prisma.listing.findMany({
        where,
        include: {
            host: { select: { name: true, avatar: true } },
        },
        take: 10,
    });
    if (listings.length === 0) {
        return res.json({
            query,
            extractedFilters: filters,
            message: "No listings found matching your criteria. Try adjusting your search filters or location.",
            results: [],
            count: 0,
        });
    }
    res.json({
        query,
        extractedFilters: filters,
        results: listings,
        count: listings.length,
    });
}
// ─── Listing Description Generator ───────────────────────────────────────────
const descriptionPrompt = ChatPromptTemplate.fromTemplate(`
You are a professional copywriter for an Airbnb-like platform.
Write an engaging, warm, and descriptive listing description.

Listing details:
- Title: {title}
- Location: {location}
- Type: {type}
- Max guests: {guests}
- Amenities: {amenities}
- Price per night: ${"{price}"} USD

Write a 3-paragraph description:
1. Opening hook — what makes this place special
2. The space — describe the property and its features
3. The location — what guests can do nearby

Keep it between 150-200 words. Be specific and inviting. Do not use generic phrases like "perfect getaway".
`);
const descriptionChain = descriptionPrompt.pipe(model).pipe(new StringOutputParser());
export async function generateListingDescription(req, res) {
    const { title, location, type, guests, amenities, price } = req.body;
    if (!title || !location || !type || !guests || !amenities || !price) {
        return res.status(400).json({ error: "title, location, type, guests, amenities, and price are required" });
    }
    const description = await descriptionChain.invoke({
        title,
        location,
        type,
        guests,
        amenities: Array.isArray(amenities) ? amenities.join(", ") : amenities,
        price,
    });
    res.json({ description });
}
// ─── Chatbot ──────────────────────────────────────────────────────────────────
const explainPrompt = ChatPromptTemplate.fromTemplate(`
You are a helpful Airbnb listing assistant.
Explain the listing clearly and helpfully based on the user's question.
Use only the listing details provided. Do not invent amenities, rules,
nearby places, availability, discounts, or policies that are not present.
If the question asks for something missing from the details, say that the
listing information does not include it.

Listing details:
- Title: {title}
- Location: {location}
- Type: {type}
- Max guests: {guests}
- Price per night: ${"{price}"} USD
- Amenities: {amenities}
- Host: {host}
- Photos available: {photoCount}
- Average review rating: {averageRating}
- Recent review comments: {reviewComments}
- Description: {description}

Question: {question}

Write a friendly, well-structured answer in 1-3 short paragraphs. Mention the
most relevant details first, and keep the answer practical for a guest deciding
whether this listing fits their needs.
`);
const explainChain = explainPrompt.pipe(model).pipe(new StringOutputParser());
const chatPrompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are a helpful Airbnb assistant. You help guests ask about a specific listing and provide useful information based on the listing details.
Use only the listing details, user context, and chat history provided. If the user is authenticated, you may also mention their booking history when relevant.
Be friendly, concise, and helpful. If you do not know something, say so.`,
    ],
    ["human", `Listing details:\n{listingContext}\n\nUser profile:\n{userContext}\n\nPrevious chat history:\n{historyContext}\n\nUser message: {input}`],
]);
const chatChain = chatPrompt.pipe(model).pipe(new StringOutputParser());
export async function explainListing(req, res) {
    const { listingId } = req.params;
    const rawQuestion = req.body?.question ?? req.query["question"];
    const question = typeof rawQuestion === "string" ? rawQuestion.trim() : "";
    if (!listingId || question.length === 0) {
        return res.status(400).json({ error: "question and listingId are required" });
    }
    const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: {
            title: true,
            description: true,
            location: true,
            pricePerNight: true,
            type: true,
            guest: true,
            amenities: true,
            host: { select: { name: true } },
            photos: { select: { id: true } },
            reviews: {
                select: { rating: true, comment: true },
                orderBy: { createdAt: "desc" },
                take: 3,
            },
        },
    });
    if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
    }
    const averageRating = listing.reviews.length > 0
        ? (listing.reviews.reduce((sum, review) => sum + review.rating, 0) /
            listing.reviews.length).toFixed(1)
        : "No reviews yet";
    const reviewComments = listing.reviews
        .map((review) => review.comment.trim())
        .filter(Boolean)
        .join(" | ") || "No review comments available";
    const answer = await explainChain.invoke({
        title: listing.title,
        location: listing.location,
        type: listing.type,
        guests: String(listing.guest),
        amenities: listing.amenities.length > 0 ? listing.amenities.join(", ") : "No amenities listed",
        price: listing.pricePerNight,
        host: listing.host.name,
        photoCount: String(listing.photos.length),
        averageRating,
        reviewComments,
        description: listing.description || "No description provided",
        question,
    });
    res.json({ listingId, question, answer });
}
//# sourceMappingURL=ai.controller.js.map