import prisma from "../config/prisma.js";
import { createListingSchema, updateListingSchema, } from "../validators/listings.validator.js";
import { setCache, getCache, clearCacheByKey } from "../config/cache.js";
const parseQueryNumber = (value) => {
    if (value === undefined)
        return undefined;
    const parsed = parseFloat(String(value));
    return Number.isNaN(parsed) ? undefined : parsed;
};
// GET all listings
export const getAllListings = async (req, res) => {
    try {
        const cacheKey = "allListings";
        const cached = getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const listings = await prisma.listing.findMany({
            include: {
                host: {
                    select: { name: true },
                },
                photos: true,
                _count: { select: { bookings: true } },
            },
        });
        setCache(cacheKey, listings, 60); // Cache for 60 seconds
        res.status(200).json(listings);
    }
    catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).json({ message: "Error fetching listings" });
    }
};
// GET listings for dashboard. Hosts see their own listings, admins see all.
export const getDashboardListings = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const where = req.role === "HOST" ? { hostId: req.userId } : {};
        const cacheKey = req.role === "HOST" ? `hostListings:${req.userId}` : "allListings";
        const cached = getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const listings = await prisma.listing.findMany({
            where,
            include: {
                host: {
                    select: { name: true },
                },
                photos: true,
                _count: { select: { bookings: true } },
            },
        });
        setCache(cacheKey, listings, 60);
        res.status(200).json(listings);
    }
    catch (error) {
        console.error("Error fetching dashboard listings:", error);
        res.status(500).json({ message: "Error fetching listings" });
    }
};
// GET listing by ID
export const getListingById = async (req, res) => {
    const id = req.params["id"];
    if (!id) {
        return res.status(400).json({ message: "Invalid listing ID" });
    }
    try {
        const listing = await prisma.listing.findUnique({
            where: { id },
            include: {
                host: true,
                bookings: {
                    include: {
                        guest: {
                            select: { name: true },
                        },
                    },
                },
                photos: true,
            },
        });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        res.json(listing);
    }
    catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).json({ message: "Error fetching listing" });
    }
};
// POST new listing
export const createListing = async (req, res, next) => {
    try {
        const data = createListingSchema.parse(req.body);
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const newListing = await prisma.listing.create({
            data: {
                title: data.title,
                description: data.description,
                location: data.location,
                pricePerNight: data.pricePerNight,
                guest: data.guest,
                type: data.type,
                amenities: data.amenities,
                hostId: req.userId,
                ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
                ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
            },
        });
        clearCacheByKey("allListings");
        clearCacheByKey(`hostListings:${req.userId}`);
        clearCacheByKey("listingsStats");
        res.status(201).json(newListing);
    }
    catch (error) {
        console.error("Error creating listing:", error);
        return next(error);
    }
};
// PUT update listing
export const updateListing = async (req, res, next) => {
    const id = req.params["id"];
    try {
        const data = updateListingSchema.parse(req.body);
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        if (listing.hostId !== req.userId && req.role !== "ADMIN")
            return res
                .status(403)
                .json({ message: "You can only edit your own listings" });
        const updatedListing = await prisma.listing.update({
            where: { id },
            data: Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined)),
        });
        clearCacheByKey("allListings");
        clearCacheByKey(`hostListings:${listing.hostId}`);
        clearCacheByKey("listingsStats");
        res.status(200).json(updatedListing);
    }
    catch (error) {
        console.error("Error updating listing:", error);
        return next(error);
    }
};
// DELETE listing
export const deleteListing = async (req, res) => {
    const id = req.params["id"];
    try {
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        if (listing.hostId !== req.userId && req.role !== "ADMIN")
            return res
                .status(403)
                .json({ message: "You can only delete your own listings" });
        const deletedListing = await prisma.listing.delete({
            where: { id },
        });
        clearCacheByKey("allListings");
        clearCacheByKey(`hostListings:${listing.hostId}`);
        clearCacheByKey("listingsStats");
        res.status(200).json(deletedListing);
    }
    catch (error) {
        console.error("Error deleting listing:", error);
        res.status(500).json({ message: "Error deleting listing" });
    }
};
export const listingsStatus = async (req, res, next) => {
    try {
        const stats = await prisma.$queryRaw `
    SELECT
    location,
    COUNT(*)::int AS total,
    ROUND(AVG("pricePerNight")::numeric, 2) AS avg_price,
    MIN("pricePerNight") AS min_price,
    MAX("pricePerNight") AS max_price
    FROM "Listing"
    GROUP BY location
    ORDER BY total DESC
    `;
        res.json(stats);
    }
    catch (error) {
        console.error("Error fetching listing status:", error);
        res.status(500).json({ message: "Error fetching listing status" });
    }
};
export const listingssearch = async (req, res, next) => {
    try {
        const { location, minPrice, maxPrice, type, guests, minLat, maxLat, minLng, maxLng, } = req.query;
        const where = {};
        const page = Math.max(1, parseInt(req.query.page || "1", 10));
        const limit = Math.max(1, parseInt(req.query.limit || "10", 10));
        const offset = (page - 1) * limit;
        if (location) {
            where.location = {
                contains: String(location),
                mode: "insensitive",
            };
        }
        if (type) {
            where.type = String(type);
        }
        if (guests) {
            const guestCount = parseInt(String(guests), 10);
            if (!Number.isNaN(guestCount)) {
                where.guest = { gte: guestCount };
            }
        }
        if (minPrice || maxPrice) {
            where.pricePerNight = {};
            const min = parseQueryNumber(minPrice);
            const max = parseQueryNumber(maxPrice);
            if (min !== undefined)
                where.pricePerNight.gte = min;
            if (max !== undefined)
                where.pricePerNight.lte = max;
        }
        const south = parseQueryNumber(minLat);
        const north = parseQueryNumber(maxLat);
        const west = parseQueryNumber(minLng);
        const east = parseQueryNumber(maxLng);
        if (south !== undefined || north !== undefined) {
            where.latitude = {};
            if (south !== undefined)
                where.latitude.gte = south;
            if (north !== undefined)
                where.latitude.lte = north;
        }
        if (west !== undefined || east !== undefined) {
            where.longitude = {};
            if (west !== undefined)
                where.longitude.gte = west;
            if (east !== undefined)
                where.longitude.lte = east;
        }
        const [listings, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                skip: offset,
                take: limit,
                include: {
                    host: {
                        select: { name: true, email: true },
                    },
                    photos: true,
                },
            }),
            prisma.listing.count({ where }),
        ]);
        res.json({
            data: listings,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("Search error:", error); // ✅ important
        next(error);
    }
};
export const listingsStats = async (req, res, next) => {
    try {
        const cacheKey = "listingsStats";
        const cached = getCache(cacheKey);
        console.log("CACHE VALUE:", cached);
        if (cached && typeof cached === "object") {
            return res.json(cached);
        }
        const [totalListings, averagePrice, byLocation, byType] = await Promise.all([
            prisma.listing.count(),
            prisma.listing.aggregate({
                _avg: { pricePerNight: true },
            }),
            prisma.listing.groupBy({
                by: ["location"],
                _count: true,
            }),
            prisma.listing.groupBy({
                by: ["type"],
                _count: true,
            }),
        ]);
        const stats = {
            totalListings,
            averagePrice: averagePrice._avg.pricePerNight || 0,
            byLocation: byLocation.map((item) => ({
                location: item.location,
                count: item._count,
            })),
            byType: byType.map((item) => ({
                type: item.type,
                count: item._count,
            })),
        };
        console.log("NEW STATS:", stats);
        setCache(cacheKey, stats, 300);
        res.json(stats);
    }
    catch (error) {
        console.error("❌ FULL ERROR:", error);
        res.status(500).json({
            error: "Database error",
            details: error.message,
        });
    }
};
//# sourceMappingURL=listings.controller.js.map