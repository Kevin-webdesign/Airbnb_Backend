import { Router, type RequestHandler } from "express";
import {
  naturalLanguageSearch,
  generateListingDescription,
  explainListing,
} from "../../controllers/ai.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /ai/search:
 *   post:
 *     summary: Search listings using natural language
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query:
 *                 type: string
 *                 example: "Find me a cozy cabin in the mountains for a weekend getaway"
 *     responses:
 *       200:
 *         description: Listings matching the natural language query
 */
router.post("/search", naturalLanguageSearch);

/**
 * @swagger
 * /ai/{id}/generate-description:
 *   post:
 *     summary: Generate a listing description using AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The listing ID. This route uses the ID in the URL, while the listing details are sent in the body.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "1d4d37fa-d8a3-4afa-ac0d-497dda0f6544"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, location, type, guests, amenities, price]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Beachfront Villa"
 *               location:
 *                 type: string
 *                 example: "Miami, FL"
 *               type:
 *                 type: string
 *                 example: "VILLA"
 *               guests:
 *                 type: integer
 *                 example: 6
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Pool", "WiFi", "BBQ"]
 *               price:
 *                 type: number
 *                 example: 250
 *     responses:
 *       200:
 *         description: Generated listing description
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                   example: "Wake up steps from the shoreline in this bright beachfront villa..."
 *       400:
 *         description: Missing required listing details
 *       401:
 *         description: Unauthorized
 */
router.post("/:id/generate-description", authenticate as RequestHandler, generateListingDescription);

/**
 * @swagger
 * /ai/chat/{listingId}:
 *   post:
 *     summary: Ask AI to explain a specific listing
 *     description: Fetches the listing by ID, then answers the user's question using only the listing details, host name, photos count, and recent reviews.
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "1d4d37fa-d8a3-4afa-ac0d-497dda0f6544"
 *         description: The ID of the listing to explain
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question]
 *             properties:
 *               question:
 *                 type: string
 *                 minLength: 1
 *                 example: "Can you explain this listing and tell me if it is good for 4 guests?"
 *     responses:
 *       200:
 *         description: Listing explanation response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 listingId:
 *                   type: string
 *                   format: uuid
 *                   example: "1d4d37fa-d8a3-4afa-ac0d-497dda0f6544"
 *                 question:
 *                   type: string
 *                   example: "Can you explain this listing and tell me if it is good for 4 guests?"
 *                 answer:
 *                   type: string
 *                   example: "This villa in Kigali can host up to 4 guests and includes WiFi, parking, and a pool. At $120 per night, it may be a good fit if you want..."
 *       400:
 *         description: question and listingId are required
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Listing not found"
 */
router.post("/chat/:listingId", explainListing);


export default router;
