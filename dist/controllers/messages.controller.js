import prisma from "../config/prisma.js";
import { createMessageSchema, listingMessagesQuerySchema, } from "../validators/messages.validator.js";
function getAuthUser(req) {
    if (!req.userId) {
        return null;
    }
    return {
        id: req.userId,
        role: req.role,
    };
}
export async function sendListingMessage(req, res, next) {
    try {
        const user = getAuthUser(req);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const listingId = req.params["id"];
        const data = createMessageSchema.parse(req.body);
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { id: true, hostId: true },
        });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        const receiverId = listing.hostId === user.id ? data.receiverId : listing.hostId;
        if (!receiverId) {
            return res.status(400).json({
                message: "receiverId is required when a host replies to a guest",
            });
        }
        if (receiverId === user.id) {
            return res.status(400).json({ message: "You cannot send a message to yourself" });
        }
        if (listing.hostId === user.id) {
            const guestHasConversation = await prisma.message.findFirst({
                where: {
                    listingId,
                    OR: [
                        { senderId: receiverId, receiverId: user.id },
                        { senderId: user.id, receiverId },
                    ],
                },
                select: { id: true },
            });
            if (!guestHasConversation) {
                return res.status(400).json({
                    message: "Host can only reply to guests who already messaged this listing",
                });
            }
        }
        const message = await prisma.message.create({
            data: {
                content: data.content,
                listingId,
                senderId: user.id,
                receiverId,
            },
            include: {
                sender: { select: { id: true, name: true, role: true, avatar: true } },
                receiver: { select: { id: true, name: true, role: true, avatar: true } },
            },
        });
        res.status(201).json(message);
    }
    catch (error) {
        next(error);
    }
}
export async function getListingMessages(req, res, next) {
    try {
        const user = getAuthUser(req);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const listingId = req.params["id"];
        const query = listingMessagesQuerySchema.parse(req.query);
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { id: true, hostId: true },
        });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        if (listing.hostId === user.id && !query.guestId) {
            return res.status(400).json({
                message: "guestId query parameter is required for hosts",
            });
        }
        const guestId = listing.hostId === user.id ? query.guestId : user.id;
        if (!guestId) {
            return res.status(400).json({ message: "guestId is required" });
        }
        const messages = await prisma.message.findMany({
            where: {
                listingId,
                OR: [
                    { senderId: guestId, receiverId: listing.hostId },
                    { senderId: listing.hostId, receiverId: guestId },
                ],
            },
            orderBy: { createdAt: "asc" },
            include: {
                sender: { select: { id: true, name: true, role: true, avatar: true } },
                receiver: { select: { id: true, name: true, role: true, avatar: true } },
            },
        });
        await prisma.message.updateMany({
            where: {
                listingId,
                receiverId: user.id,
                readAt: null,
            },
            data: { readAt: new Date() },
        });
        res.json(messages);
    }
    catch (error) {
        next(error);
    }
}
export async function getListingConversations(req, res, next) {
    try {
        const user = getAuthUser(req);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const listingId = req.params["id"];
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { id: true, hostId: true },
        });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        if (listing.hostId !== user.id && user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Only the listing host can view listing conversations",
            });
        }
        const messages = await prisma.message.findMany({
            where: { listingId },
            orderBy: { createdAt: "desc" },
            include: {
                sender: { select: { id: true, name: true, role: true, avatar: true } },
                receiver: { select: { id: true, name: true, role: true, avatar: true } },
            },
        });
        const conversations = new Map();
        for (const message of messages) {
            const guest = message.senderId === listing.hostId ? message.receiver : message.sender;
            if (!conversations.has(guest.id)) {
                conversations.set(guest.id, message);
            }
        }
        res.json(Array.from(conversations.values()).map((lastMessage) => {
            const guest = lastMessage.senderId === listing.hostId
                ? lastMessage.receiver
                : lastMessage.sender;
            return {
                guest,
                lastMessage,
            };
        }));
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=messages.controller.js.map