import express, {} from "express";
import { createBooking, deleteBooking, getAllBookings, getBookingById, updateBooking, changeBookingStatus } from "../../controllers/booking.controller.js";
import { authenticate, requireGuest, requireHost } from "../../middlewares/auth.middleware.js";
const router = express.Router();
/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Retrieve a list of all bookings for the authenticated guest
 *     description: Retrieve a list of all bookings for the authenticated guest. Requires authentication.
 *     security:
 *      - bearerAuth: []
 *     tags:
 *       - Bookings
 *     responses:
 *       200:
 *         description: A list of bookings for the authenticated guest
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Retrieve a single booking by ID for the authenticated guest
 *     description: Retrieve a single booking by its ID for the authenticated guest. Requires authentication.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the booking to retrieve
 *     responses:
 *       200:
 *         description: The requested booking
 *       400:
 *         description: Bad request
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking for the authenticated guest
 *     description: Create a new booking for the authenticated guest. Requires authentication.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               listingId:
 *                 type: string
 *                 format: uuid
 *               checkIn:
 *                 type: string
 *                 format: date-time
 *               checkOut:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - listingId
 *               - checkIn
 *               - checkOut
 *           example:
 *             listingId: "4d4bd274-6c86-4d6d-a84f-d3d7deab3534"
 *             checkIn: "2026-05-18T00:00:00.000Z"
 *             checkOut: "2026-05-20T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: The created booking
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update an existing booking for the authenticated guest
 *     description: Update an existing booking for the authenticated guest. Requires authentication.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the booking to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               listingId:
 *                 type: string
 *                 format: uuid
 *               checkIn:
 *                 type: string
 *                 format: date-time
 *               checkOut:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - listingId
 *               - checkIn
 *               - checkOut
 *           example:
 *             listingId: "4d4bd274-6c86-4d6d-a84f-d3d7deab3534"
 *             checkIn: "2026-05-18T00:00:00.000Z"
 *             checkOut: "2026-05-20T00:00:00.000Z"
 *     responses:
 *       200:
 *         description: The updated booking
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete a booking for the authenticated guest
 *     description: Delete a booking for the authenticated guest. Requires authentication.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the booking to delete
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /bookings/approve/{id}:
 *   put:
 *     summary: Approve or cancel a booking (host only)
 *     description: Approve or cancel a booking by changing its status. Requires host authentication.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the booking to approve or cancel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, CANCELLED]
 *           example:
 *             status: "CONFIRMED"
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticate, getAllBookings);
router.get("/:id", authenticate, requireGuest, getBookingById);
router.post("/", authenticate, requireGuest, createBooking);
router.delete("/:id", authenticate, requireGuest, deleteBooking);
router.put("/approve/:id", authenticate, requireHost, changeBookingStatus);
router.put("/:id", authenticate, requireGuest, updateBooking);
export default router;
//# sourceMappingURL=booking.routes.js.map