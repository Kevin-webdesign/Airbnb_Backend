import express, { type RequestHandler } from "express";
import { login, register ,getMe , forgotPassword , resetPassword , changePassword, becomehost} from "../../controllers/auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the provided details.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *               - name
 *           example:
 *             email: "user@example.com"
 *             password: "password123"
 *             name: "John Doe"
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 *
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Log in a user with email and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *           example:
 *             email: "user@example.com"
 *             password: "password123"
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 *
 * /auth/me:
 *   get:
 *     summary: Get current user details
 *     description: Get details of the currently authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user details
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 *
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Request a password reset link to be sent to the user's email.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *           example:
 *             email: "user@example.com"
 *     responses:
 *       '200':
 *         description: Password reset link sent successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 *
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password
 *     description: Reset the user's password using the provided token.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *             required:
 *               - password
 *           example:
 *             password: "newpassword123"
 *     responses:
 *       '200':
 *         description: Password reset successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 *
 * /auth/change-password:
 *   post:
 *     summary: Change password
 *     description: Change password for the authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required:
 *               - oldPassword
 *               - newPassword
 *           example:
 *             oldPassword: "oldpassword123"
 *             newPassword: "newpassword123"
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 *
 * /auth/become-host:
 *   post:
 *     summary: Become a host
 *     description: Change the authenticated user's role from GUEST to HOST and return a refreshed token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User role updated to host
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate as RequestHandler, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword); 
router.post("/change-password", authenticate as RequestHandler, changePassword);
router.post("/become-host", authenticate as RequestHandler, becomehost);

export default router;
