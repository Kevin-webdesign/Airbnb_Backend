import express, { type RequestHandler } from "express";
import { createReview, getListingReviews ,deleteReview } from "../../controllers/reviews.controller.js";
import { authenticate, requireGuest } from "../../middlewares/auth.middleware.js";


const router = express.Router();

/**
 * @swagger
 * /reviews/{id}:
 *   post:
 *     summary: Create a review for a listing
 *     description: Create a review for a listing. Requires authentication.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the listing to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: The created review
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get reviews for a listing
 *     description: Get public reviews for a listing. Does not require authentication.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the listing to get reviews for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of reviews to return per page
 *     responses:
 *       200:
 *         description: A list of reviews for the listing
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review for a listing
 *     description: Delete a review for a listing. Requires authentication.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the listing to delete the review for
 *     responses:
 *       200:
 *         description: The deleted review
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */

router.post("/:id", authenticate as RequestHandler, requireGuest as RequestHandler, createReview);
router.get("/:id", getListingReviews );
router.delete("/:id", authenticate as RequestHandler, deleteReview )

export default router;
