import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
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
// Store conversation histories in memory
// In production, store these in Redis or a database
const sessionHistories = new Map();
function getSessionHistory(sessionId) {
    if (!sessionHistories.has(sessionId)) {
        sessionHistories.set(sessionId, new InMemoryChatMessageHistory());
    }
    return sessionHistories.get(sessionId);
}
// ─── Chatbot ──────────────────────────────────────────────────────────────────
const chatPrompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are a helpful Airbnb assistant. You help guests find listings, answer questions about properties, and assist with bookings.

Available listings context: {listingsContext}

Be friendly, concise, and helpful. If you don't know something, say so.
If asked about specific listings, refer to the context provided.`,
    ],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
]);
const chatChain = chatPrompt.pipe(model);
const chainWithHistory = new RunnableWithMessageHistory({
    runnable: chatChain,
    getMessageHistory: getSessionHistory,
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
});
export async function chat(req, res) {
    const { message, sessionId } = req.body;
    if (!message || !sessionId) {
        return res.status(400).json({ error: "message and sessionId are required" });
    }
    // Fetch recent listings to give the AI context about available properties
    const listings = await prisma.listing.findMany({
        take: 5,
        select: {
            title: true,
            location: true,
            pricePerNight: true,
            type: true,
            guests: true,
            amenities: true,
        },
    });
    const listingsContext = listings
        .map((l) => `- ${l.title} in ${l.location}: $${l.pricePerNight}/night, ${l.type}, up to ${l.guests} guests, amenities: ${l.amenities.join(", ")}`)
        .join("\n");
    const reply = await chainWithHistory.invoke({ input: message, listingsContext }, { configurable: { sessionId } });
    res.json({ reply, sessionId });
}
//# sourceMappingURL=ai.controller.js.map