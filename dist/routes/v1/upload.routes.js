import { Router } from "express";
import upload from "../../config/multer.js";
import { deleteAvatar, deleteListingPhoto, uploadAvatar, uploadListingPhoto } from "../../controllers/upload.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
const router = Router();
/**
 * @swagger
 * /upload/{id}/avatar:
 *   post:
 *     summary: Upload a user avatar
 *     description: Upload a user avatar. Requires authentication.
 *     tags: [Upload]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user for whom to upload an avatar
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              image:
 *                type: string
 *                format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * @swagger
 * /upload/{id}/avatar:
 *   delete:
 *     summary: Delete a user avatar
 *     description: Delete a user avatar. Requires authentication.
 *     tags: [Upload]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user for whom to delete an avatar
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * @swagger
 * /upload/listing/{id}/photo:
 *   post:
 *     summary: Upload a listing photo
 *     description: Upload a listing photo. Requires authentication.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the listing for which to upload a photo
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Listing photo uploaded successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 * @swagger
 * /upload/listing/{id}/photo:
 *   delete:
 *     summary: Delete a listing photo
 *     description: Delete a listing photo. Requires authentication.
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the listing for which to delete a photo
 *     responses:
 *       200:
 *         description: Listing photo deleted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/:id/avatar", authenticate, upload.single("image"), uploadAvatar);
router.delete("/:id/avatar", authenticate, deleteAvatar);
router.post("/listing/:id/photo", authenticate, upload.single("image"), uploadListingPhoto);
router.delete("/listing/:id/photo", authenticate, deleteListingPhoto);
export default router;
//# sourceMappingURL=upload.routes.js.map