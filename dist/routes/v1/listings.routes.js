import express, {} from "express";
import { createListing, deleteListing, getAllListings, getDashboardListings, getListingById, listingssearch, listingsStats, listingsStatus, updateListing, } from "../../controllers/listings.controller.js";
import { getListingConversations, getListingMessages, sendListingMessage, } from "../../controllers/messages.controller.js";
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
 *       description: Retrieve public listings without authentication.
 *       tags:
 *         - Listings
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
 *                   latitude: -1.9441
 *                   longitude: 30.0619
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
 *               latitude: -1.9441
 *               longitude: 30.0619
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
 *                 latitude: -1.9441
 *                 longitude: 30.0619
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
 *               latitude: -1.9441
 *               longitude: 30.0619
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
 *                 latitude: -1.9441
 *                 longitude: 30.0619
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
 *                 latitude: -1.9441
 *                 longitude: 30.0619
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
 *         - in: query
 *           name: minLat
 *           schema:
 *             type: number
 *           required: false
 *           description: Southern latitude bound for map viewport search
 *         - in: query
 *           name: maxLat
 *           schema:
 *             type: number
 *           required: false
 *           description: Northern latitude bound for map viewport search
 *         - in: query
 *           name: minLng
 *           schema:
 *             type: number
 *           required: false
 *           description: Western longitude bound for map viewport search
 *         - in: query
 *           name: maxLng
 *           schema:
 *             type: number
 *           required: false
 *           description: Eastern longitude bound for map viewport search
 *       responses:
 *         200:
 *           description: A list of listings matching the search criteria
 *         400:
 *           description: Bad request
 *         500:
 *           description: Internal server error
 *   /listings/dashboard:
 *     get:
 *       summary: Retrieve dashboard listings
 *       description: Retrieve listings for logged-in users. Admins get all listings and hosts get only listings they created.
 *       tags:
 *         - Listings
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: A list of listings for the authenticated dashboard user
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/Listing"
 *         401:
 *           description: Unauthorized
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
 *   /listings/{id}/messages:
 *     get:
 *       summary: Get messages for a listing conversation
 *       description: Get messages between the authenticated guest and the listing host. Hosts must provide guestId to select the conversation.
 *       tags:
 *         - Listings
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *             format: uuid
 *           required: true
 *           description: The listing ID
 *         - in: query
 *           name: guestId
 *           schema:
 *             type: string
 *             format: uuid
 *           required: false
 *           description: Required when the authenticated user is the listing host
 *       responses:
 *         200:
 *           description: Conversation messages
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     content:
 *                       type: string
 *                     listingId:
 *                       type: string
 *                       format: uuid
 *                     senderId:
 *                       type: string
 *                       format: uuid
 *                     receiverId:
 *                       type: string
 *                       format: uuid
 *                     readAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     sender:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                           nullable: true
 *                     receiver:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                           nullable: true
 *               example:
 *                 - id: "0a43d73d-0f27-4550-9b89-a56f5a598a1c"
 *                   content: "Is this listing available next weekend?"
 *                   listingId: "4d4bd274-6c86-4d6d-a84f-d3d7deab3534"
 *                   senderId: "5bc33d1d-1151-4f5f-9ac5-f17b7605fc02"
 *                   receiverId: "7b46c8a9-3442-4385-b0f0-f5347e1789d1"
 *                   readAt: null
 *                   createdAt: "2026-05-12T10:00:00.000Z"
 *                   sender:
 *                     id: "5bc33d1d-1151-4f5f-9ac5-f17b7605fc02"
 *                     name: "Guest User"
 *                     role: "GUEST"
 *                     avatar: null
 *                   receiver:
 *                     id: "7b46c8a9-3442-4385-b0f0-f5347e1789d1"
 *                     name: "Host User"
 *                     role: "HOST"
 *                     avatar: null
 *         400:
 *           description: guestId is required for hosts
 *         401:
 *           description: Unauthorized
 *         404:
 *           description: Listing not found
 *         500:
 *           description: Internal server error
 *     post:
 *       summary: Send a message about a listing
 *       description: Send a message between a guest and the listing host. Guests send to the host automatically; hosts include receiverId to reply to a guest.
 *       tags:
 *         - Listings
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *             format: uuid
 *           required: true
 *           description: The listing ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - content
 *               properties:
 *                 content:
 *                   type: string
 *                   minLength: 1
 *                   maxLength: 2000
 *                 receiverId:
 *                   type: string
 *                   format: uuid
 *                   description: Required when the listing host replies to a guest
 *             examples:
 *               guestMessage:
 *                 summary: Guest sends message to host
 *                 value:
 *                   content: "Is this listing available next weekend?"
 *               hostReply:
 *                 summary: Host replies to guest
 *                 value:
 *                   content: "Yes, it is available."
 *                   receiverId: "5bc33d1d-1151-4f5f-9ac5-f17b7605fc02"
 *       responses:
 *         201:
 *           description: Message created
 *         400:
 *           description: Bad request
 *         401:
 *           description: Unauthorized
 *         404:
 *           description: Listing not found
 *         500:
 *           description: Internal server error
 *   /listings/{id}/conversations:
 *     get:
 *       summary: Get conversations for a listing
 *       description: Return one conversation summary per guest for a listing. Only the listing host or an admin can access this endpoint.
 *       tags:
 *         - Listings
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           schema:
 *             type: string
 *             format: uuid
 *           required: true
 *           description: The listing ID
 *       responses:
 *         200:
 *           description: Listing conversations
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     guest:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                           nullable: true
 *                     lastMessage:
 *                       type: object
 *               example:
 *                 - guest:
 *                     id: "5bc33d1d-1151-4f5f-9ac5-f17b7605fc02"
 *                     name: "Guest User"
 *                     role: "GUEST"
 *                     avatar: null
 *                   lastMessage:
 *                     id: "0a43d73d-0f27-4550-9b89-a56f5a598a1c"
 *                     content: "Is this listing available next weekend?"
 *                     createdAt: "2026-05-12T10:00:00.000Z"
 *         401:
 *           description: Unauthorized
 *         403:
 *           description: Only the listing host can view listing conversations
 *         404:
 *           description: Listing not found
 *         500:
 *           description: Internal server error
 */
const router = express.Router();
router.get("/", getAllListings);
router.get("/stats", listingsStats);
router.get("/check", listingsStatus);
router.get("/dashboard", authenticate, getDashboardListings);
router.get("/search", listingssearch);
router.get("/:id/conversations", authenticate, getListingConversations);
router.get("/:id/messages", authenticate, getListingMessages);
router.get("/:id", getListingById);
router.post("/", authenticate, requireHost, createListing);
router.post("/:id/messages", authenticate, sendListingMessage);
router.put("/:id", authenticate, updateListing);
router.delete("/:id", authenticate, deleteListing);
export default router;
//# sourceMappingURL=listings.routes.js.map