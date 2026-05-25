import prisma from "../config/prisma.js";
import { createBookingSchema } from "../validators/bookings.validator.js";
import { sendEmail } from "../config/email.js";
import { NotificationType } from "@prisma/client";
import { createNotification } from "../services/notifications.service.js";
import { bookingConfirmationEmail, bookingCancellationEmail, } from "../templates/emails.js";
// GET all bookings
export const getAllBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                skip,
                take: limit,
                include: {
                    guest: {
                        select: { name: true },
                    },
                    listing: {
                        select: {
                            title: true,
                            location: true,
                            photos: {
                                select: { id: true, url: true },
                            },
                        },
                    },
                },
            }),
            prisma.booking.count(),
        ]);
        res.status(200).json({
            data: bookings,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Error fetching bookings" });
    }
};
// GET booking by ID
export const getBookingById = async (req, res) => {
    const id = req.params["id"];
    try {
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                guest: true,
                listing: {
                    include: {
                        photos: {
                            select: { id: true, url: true },
                        },
                    },
                },
            },
        });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json(booking);
    }
    catch (error) {
        console.error("Error fetching booking:", error);
        res.status(404).json({ message: "Booking not found" });
    }
};
// POST new booking
export const createBooking = async (req, res) => {
    try {
        const parsed = createBookingSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            }));
            return res.status(400).json({ errors });
        }
        const listing = await prisma.listing.findUnique({
            where: { id: parsed.data.listingId },
            select: {
                id: true,
                title: true,
                pricePerNight: true,
                hostId: true,
            },
        });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }
        const days = Math.ceil((new Date(parsed.data.checkOut).getTime() -
            new Date(parsed.data.checkIn).getTime()) /
            (1000 * 60 * 60 * 24));
        const { listingId, checkIn, checkOut } = parsed.data;
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const guestId = req.userId;
        const totalPrice = listing.pricePerNight * days;
        const newBooking = await prisma.$transaction(async (tx) => {
            const conflict = await tx.booking.findFirst({
                where: {
                    listingId,
                    status: "CONFIRMED",
                    checkIn: { lt: checkOut },
                    checkOut: { gt: checkIn },
                },
            });
            if (conflict) {
                throw new Error("BOOKING_CONFLICT");
            }
            return tx.booking.create({
                data: { listingId, guestId, checkIn, checkOut, totalPrice, status: "PENDING" },
            });
        });
        await createNotification({
            userId: listing.hostId,
            type: NotificationType.BOOKING_CREATED,
            title: "New booking request",
            message: `A guest requested to book ${listing.title}`,
            data: {
                bookingId: newBooking.id,
                listingId,
                guestId,
            },
        });
        res.status(201).json(newBooking);
    }
    catch (error) {
        if (error instanceof Error && error.message === "BOOKING_CONFLICT") {
            return res.status(409).json({ message: "Booking conflict: dates are already booked" });
        }
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Error creating booking" });
    }
};
// DELETE booking
export const deleteBooking = async (req, res) => {
    const id = req.params["id"];
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const booking = await prisma.booking.findUnique({ where: { id } });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.status == "CANCELLED") {
            return res.status(400).json({ message: "Booking is already cancelled" });
        }
        if (booking.guestId === req.userId) {
            const deletedBooking = await prisma.booking.update({
                where: { id },
                data: { status: "CANCELLED" },
                include: {
                    listing: { select: { id: true, title: true, hostId: true } },
                },
            });
            await createNotification({
                userId: deletedBooking.listing.hostId,
                type: NotificationType.BOOKING_CANCELLED,
                title: "Booking cancelled",
                message: `A guest cancelled their booking for ${deletedBooking.listing.title}`,
                data: {
                    bookingId: deletedBooking.id,
                    listingId: deletedBooking.listing.id,
                    guestId: deletedBooking.guestId,
                },
            });
            return res
                .status(200)
                .json({ message: "Booking cancelled successfully" });
        }
        const deletedBooking = await prisma.booking.delete({
            where: { id },
        });
        res.status(200).json({ message: "booking deleted successfull" });
    }
    catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ message: "Error deleting booking" });
    }
};
export const changeBookingStatus = async (req, res, next) => {
    try {
        const id = req.params["id"];
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        const existingBooking = await prisma.booking.findUnique({ where: { id } });
        if (!existingBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status },
        });
        const Bookingdeatails = await prisma.booking.findUnique({
            where: { id },
            select: {
                id: true,
                checkIn: true,
                checkOut: true,
                guestId: true,
                listing: {
                    select: { id: true, title: true, hostId: true },
                },
                guest: {
                    select: { email: true, name: true },
                },
            },
        });
        if (updatedBooking.status === "CONFIRMED") {
            const emailContent = bookingConfirmationEmail(Bookingdeatails?.guest.name || "", Bookingdeatails?.listing.title || "", Bookingdeatails?.checkIn.toDateString() || "", Bookingdeatails?.checkOut.toDateString() || "");
            await sendEmail(Bookingdeatails?.guest.email || "", "Booking Confirmed!", emailContent);
            if (Bookingdeatails) {
                await createNotification({
                    userId: Bookingdeatails.guestId,
                    type: NotificationType.BOOKING_CONFIRMED,
                    title: "Booking confirmed",
                    message: `Your booking for ${Bookingdeatails.listing.title} was confirmed`,
                    data: {
                        bookingId: Bookingdeatails.id,
                        listingId: Bookingdeatails.listing.id,
                    },
                });
            }
        }
        if (updatedBooking.status === "CANCELLED") {
            const emailContent = bookingCancellationEmail(Bookingdeatails?.guest.name || "", Bookingdeatails?.listing.title || "", Bookingdeatails?.checkIn.toDateString() || "", Bookingdeatails?.checkOut.toDateString() || "", `http://localhost:3000/listings`);
            await sendEmail(Bookingdeatails?.guest.email || "", "Booking Cancelled!", emailContent);
            if (Bookingdeatails) {
                await createNotification({
                    userId: Bookingdeatails.guestId,
                    type: NotificationType.BOOKING_CANCELLED,
                    title: "Booking cancelled",
                    message: `Your booking for ${Bookingdeatails.listing.title} was cancelled`,
                    data: {
                        bookingId: Bookingdeatails.id,
                        listingId: Bookingdeatails.listing.id,
                    },
                });
            }
        }
        res
            .status(200)
            .json({ message: "Booking status updated successfully", updatedBooking });
    }
    catch (error) {
        next(error);
    }
};
// PUT update booking
export const updateBooking = async (req, res) => {
    const id = req.params["id"];
    const { checkIn, guestId, totalPrice, listingId, status } = req.body;
    try {
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                checkIn,
                guestId,
                totalPrice,
                listingId,
                status,
            },
        });
        res
            .status(200)
            .json({ message: "Updating booking successfull", updatedBooking });
    }
    catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ message: "Error updating booking" });
    }
};
//# sourceMappingURL=booking.controller.js.map