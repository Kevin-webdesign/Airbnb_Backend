import prisma from "../config/prisma.js";
import { setCache, getCache, clearCache } from "../config/cache.js";
export const createReview = async (req, res) => {
    const listingId = req.params["id"];
    if (!listingId) {
        return res.status(400).json({ message: "Invalid listing ID" });
    }
    try {
        const { rating, comment } = req.body;
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!rating || !comment) {
            return res
                .status(400)
                .json({ message: "Missing required fields: rating, comment" });
        }
        if (typeof rating !== "number" || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                userId: req.userId,
                listingId,
            },
            include: {
                user: {
                    select: { name: true, avatar: true },
                },
            },
        });
        clearCache(listingId);
        res.status(201).json(review);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating review" });
    }
};
// GET /listings/:id/reviews (paginated)
export const getListingReviews = async (req, res) => {
    const listingId = req.params["id"];
    if (!listingId) {
        return res.status(400).json({ message: "Invalid listing ID" });
    }
    try {
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "10", 10);
        const skip = (page - 1) * limit;
        const cacheKey = `${listingId}:${page}:${limit}`;
        const cached = getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { listingId },
                skip,
                take: limit,
                include: {
                    user: {
                        select: { name: true, avatar: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.review.count({
                where: { listingId },
            }),
        ]);
        const response = {
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
        setCache(cacheKey, response, 30); // Cache for 30 seconds
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching reviews" });
    }
};
// DELETE /reviews/:id
export const deleteReview = async (req, res) => {
    const reviewId = req.params.id;
    if (!reviewId) {
        return res.status(400).json({ message: "Invalid review ID" });
    }
    try {
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        await prisma.review.delete({
            where: { id: reviewId },
        });
        clearCache(review.listingId);
        res.status(200).json({ message: "Review deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting review" });
    }
};
//# sourceMappingURL=reviews.controller.js.map