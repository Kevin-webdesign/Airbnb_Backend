import express, {} from "express";
import { createUser, deleteUser, getAllUsers, getUser, updateUser, getUserBookings, CountbyRole } from "../../controllers/users.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
const router = express.Router();
// GET all users
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of all users
 *     description: Retrieve a list of all users in the system. Requires authentication.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve a single user by ID
 *     description: Retrieve a single user by their ID. Requires authentication.
 *     tags: [Users]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: The requested user
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 * @swagger
 * /users:
 *   post:
 *    summary: Create a new user
 *    description: Create a new user in the system. Requires authentication.
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: "#/components/schemas/User"
 *    responses:
 *     201:
 *      description: User created successfully
 *     400:
 *      description: Bad request
 *     500:
 *      description: Internal server error
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update an existing user
 *     description: Update an existing user in the system. Requires authentication.
 *     tags: [Users]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to update
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: "#/components/schemas/User"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user from the system. Requires authentication.
 *     tags: [Users]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get user statistics by role
 *     description: Get user statistics by role. Requires authentication.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      200:
 *       description: User statistics by role
 *      400:
 *       description: Bad request
 *      500:
 *       description: Internal server error
 */
router.get("/", getAllUsers);
router.get("/stats", authenticate, CountbyRole);
router.get("/users/:id", authenticate, getUser);
router.get("/:id/bookings", authenticate, getUserBookings);
router.get("/:id", authenticate, getUser);
router.post("/", authenticate, createUser);
router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);
export default router;
//# sourceMappingURL=users.routes.js.map