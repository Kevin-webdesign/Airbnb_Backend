import express, { type RequestHandler } from "express";
import {
  createSystemNotification,
  deleteNotification,
  getAllNotifications,
  getMyNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../controllers/notifications.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: User and system notifications
 * /notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SYSTEM, MESSAGE, BOOKING_CREATED, BOOKING_CONFIRMED, BOOKING_CANCELLED, LISTING, REVIEW]
 *     responses:
 *       200:
 *         description: Notifications for the authenticated user
 *   post:
 *     summary: Create a system notification as an admin
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               userId:
 *                 type: string
 *                 format: uuid
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               role:
 *                 type: string
 *                 enum: [ADMIN, GUEST, HOST]
 *               broadcast:
 *                 type: boolean
 *               data:
 *                 type: object
 *           example:
 *             title: "Platform update"
 *             message: "New booking tools are available."
 *             broadcast: true
 *     responses:
 *       201:
 *         description: System notification created
 * /notifications/all:
 *   get:
 *     summary: Get all notifications as an admin
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All system notifications
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications marked as read
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Notification marked as read
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Notification deleted
 */

router.get("/", authenticate as RequestHandler, getMyNotifications);
router.get("/all", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, getAllNotifications);
router.get("/unread-count", authenticate as RequestHandler, getUnreadNotificationsCount);
router.post("/", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, createSystemNotification);
router.patch("/read-all", authenticate as RequestHandler, markAllNotificationsAsRead);
router.patch("/:id/read", authenticate as RequestHandler, markNotificationAsRead);
router.delete("/:id", authenticate as RequestHandler, deleteNotification);

export default router;
