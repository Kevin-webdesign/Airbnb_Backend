import prisma from "../config/prisma.js";
import { createUserSchema, updateUserSchema, } from "../validators/users.validator.js";
import { setCache, getCache, clearCacheByKey } from "../config/cache.js";
import { tr } from "zod/locales";
// GET all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users" });
    }
};
// Get one User
export const getUser = async (req, res) => {
    const id = req.params["id"];
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (user?.role === "HOST") {
            const listings = await prisma.listing.findMany({
                where: { hostId: id },
                include: {
                    _count: { select: { bookings: true } },
                },
            });
            return res.status(200).json({ ...user, listings });
        }
        else if (user?.role === "GUEST") {
            const bookings = await prisma.booking.findMany({
                where: { guestId: id },
                include: {
                    listing: {
                        include: {
                            host: {
                                select: { name: true },
                            },
                        },
                    },
                },
            });
            return res.status(200).json({ ...user, bookings });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching user" });
    }
};
export const createUser = async (req, res, next) => {
    try {
        const data = createUserSchema.parse(req.body);
        const existingEmail = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const existingUsername = await prisma.user.findUnique({
            where: { username: data.username },
        });
        if (existingUsername) {
            return res.status(400).json({ error: "Username already exists" });
        }
        const { password, ...userData } = data;
        const createData = userData;
        if (password !== undefined && password !== null) {
            createData.password = password;
        }
        const newUser = await prisma.user.create({
            data: createData,
        });
        clearCacheByKey("usersStats");
        res.status(201).json(newUser);
    }
    catch (error) {
        console.log("Error creating user:", error);
        return next(error);
    }
};
export const updateUser = async (req, res, next) => {
    const id = req.params["id"];
    try {
        const data = updateUserSchema.parse(req.body);
        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ error: "User not found" });
        // Check for duplicate email (if email is being updated)
        if (data.email && data.email !== existing.email) {
            const duplicateEmail = await prisma.user.findUnique({
                where: { email: data.email },
            });
            if (duplicateEmail) {
                return res.status(409).json({ error: "Email already exists" });
            }
        }
        // Check for duplicate username (if username is being updated)
        if (data.username && data.username !== existing.username) {
            const duplicateUsername = await prisma.user.findUnique({
                where: { username: data.username },
            });
            if (duplicateUsername) {
                return res.status(409).json({ error: "Username already exists" });
            }
        }
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.email !== undefined ? { email: data.email } : {}),
                ...(data.username !== undefined ? { username: data.username } : {}),
                ...(data.phone !== undefined ? { phone: data.phone } : {}),
                ...(data.role !== undefined ? { role: data.role } : {}),
                ...(data.password !== undefined ? { password: data.password } : {}),
            },
        });
        clearCacheByKey("usersStats");
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.log("Error updating user:", error);
        return next(error);
    }
};
export const deleteUser = async (req, res) => {
    const id = req.params["id"];
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ message: "User not found" });
    }
    try {
        await prisma.user.delete({ where: { id } });
        clearCacheByKey("usersStats");
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
};
export const getUserBookings = async (req, res) => {
    const id = req.params["id"];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.role === "GUEST") {
            const bookings = await prisma.booking.findMany({
                where: { guestId: id },
                include: {
                    listing: {
                        include: {
                            host: {
                                select: { name: true },
                            },
                        },
                    },
                },
                skip,
                take: limit,
            });
            return res.status(200).json(bookings);
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching bookings" });
    }
};
export const CountbyRole = async (req, res, next) => {
    try {
        const cacheKey = "usersStats";
        const cached = getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const hostCount = await prisma.user.count({ where: { role: "HOST" } });
        const guestCount = await prisma.user.count({ where: { role: "GUEST" } });
        const stats = { "totalHOST": hostCount, "totalGUEST": guestCount };
        setCache(cacheKey, stats, 300); // Cache for 5 minutes
        res.status(200).json(stats);
    }
    catch (error) {
        return next(error);
    }
};
//# sourceMappingURL=users.controller.js.map