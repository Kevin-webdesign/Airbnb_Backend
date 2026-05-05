import express, {} from "express";
import { createListing, deleteListing, getAllListings, getListingById, listingssearch, listingsStats, listingsStatus, updateListing, } from "../../controllers/listings.controller.js";
import { authenticate, requireHost } from "../../middlewares/auth.middleware.js";
/**
 * @swagger
 * tags:
 *   - name: Listings
 *     description: Listing management
 * paths:
 *   /listings:
 *     get:
 *       summary: Retrieve a list of all listings
 *       description: Retrieve a list of all listings in the system. Requires authentication.
 *       tags:
 *         - Listings
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: A list of listings
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/Listing"
 *               example:
 *                 - id: "1"
 *                   title: "Cozy Apartment in Downtown"
 *                   description: "A cozy apartment located in the heart of the city, close to all attractions."
 *                   price: 150.00
 *                   location: "123 Main St, Anytown, USA"
 *                   hostId: "3"
 *         400:
 *           description: Bad request
 *         500:
 *           description: Internal server error
 *     post:
 *       summary: Create a new listing
 *       description: Create a new listing in the system. Requires authentication and host role.
 *       tags:
 *         - Listings
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Listing"
 *             example:
 *               title: "Cozy Apartment in Downtown"
 *               description: "A cozy apartment located in the heart of the city, close to all attractions."
 *               price: 150.00
 *               location: "123 Main St, Anytown, USA"
 *               hostId: "3"
 *       responses:
 *         201:
 *           description: The created listing
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/Listing"
 *               example:
 *                 id: "1"
 *                 title: "Cozy Apartment in Downtown"
 *                 description: "A cozy apartment located in the heart of the city, close to all attractions."
 *                 price: 150.00
 *                 location: "123 Main St, Anytown, USA"
 *                 hostId: "3"
 *         400:
 *           description: Bad request
 *         401:
 *           description: Unauthorized
 *         500:
 *           description: Internal server error
 *     put:
 *       summary: Update an existing listing
 *       description: Update an existing listing by its ID. Requires authentication and host role.
 *       tags:
 *         - Listings
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: The ID of the listing to update
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Listing"
 *             example:
 *               title: "Modern Apartment in Downtown"
 *               description: "An updated description"
 *               price: 175.00
 *               location: "123 Main St, Anytown, USA"
 *       responses:
 *         200:
 *           description: The updated listing
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/Listing"
 *               example:
 *                 id: "1"
 *                 title: "Modern Apartment in Downtown"
 *                 description: "An updated description"
 *                 price: 175.00
 *                 location: "123 Main St, Anytown, USA"
 *                 hostId: "3"
 *         400:
 *           description: Bad request
 *         401:
 *           description: Unauthorized
 *         404:
 *           description: Listing not found
 *         500:
 *           description: Internal server error
 *     delete:
 *       summary: Delete an existing listing
 *       description: Delete an existing listing by its ID. Requires authentication and host role.
 *       tags:
 *         - Listings
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: The ID of the listing to delete
 *       responses:
 *         200:
 *           description: The deleted listing
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: "#/components/schemas/Listing"
 *               example:
 *                 id: "1"
 *                 title: "Cozy Apartment in Downtown"
 *                 description: "A cozy apartment located in the heart of the city, close to all attractions."
 *                 price: 150.00
 *                 location: "123 Main St, Anytown, USA"
 *                 hostId: "3"
 *         400:
 *           description: Bad request
 *         401:
 *           description: Unauthorized
 *         404:
 *           description: Listing not found
 *         500:
 *           description: Internal server error
 *   /listings/search:
 *     get:
 *       summary: Search for listings
 *       description: Search for listings based on query parameters. Requires authentication.
 *       tags:
 *         - Listings
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: location
 *           schema:
 *             type: string
 *           required: false
 *           description: The location to search for listings
 *         - in: query
 *           name: minPrice
 *           schema:
 *             type: number
 *           required: false
 *           description: The minimum price to search for listings
 *         - in: query
 *           name: maxPrice
 *           schema:
 *             type: number
 *           required: false
 *           description: The maximum price to search for listings
 *       responses:
 *         200:
 *           description: A list of listings matching the search criteria
 *         400:
 *           description: Bad request
 *         500:
 *           description: Internal server error
 *   /listings/stats:
 *     get:
 *       summary: Retrieve listing statistics
 *       description: Retrieve status and statistics for listings. Requires authentication.
 *       tags:
 *         - Listings
 *       responses:
 *         200:
 *           description: Listing statistics
 *         400:
 *           description: Bad request
 *         500:
 *           description: Internal server error
 *   /listings/check:
 *     get:
 *       summary: Check listing status
 *       description: Check the status of listings. Requires authentication.
 *       tags:
 *         - Listings
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Listing status
 *         400:
 *           description: Bad request
 *         500:
 *           description: Internal server error
 */
const router = express.Router();
router.get("/", getAllListings);
router.get("/stats", listingsStats);
router.get("/check", listingsStatus);
router.get("/search", listingssearch);
router.get("/:id", getListingById);
router.post("/", authenticate, requireHost, createListing);
router.put("/:id", authenticate, updateListing);
router.delete("/:id", authenticate, deleteListing);
export default router;
//# sourceMappingURL=listings.routes.js.map