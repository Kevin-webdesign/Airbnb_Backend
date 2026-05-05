import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.js";
import prisma from "../config/prisma.js";
export async function uploadAvatar(req, res) {
    const id = req.params["id"];
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    // Upload the buffer to Cloudinary under the "airbnb/avatars" folder
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, "airbnb/avatars");
    // Save the Cloudinary URL to the user's record in the database
    const updated = await prisma.user.update({
        where: { id },
        data: { avatar: url,
            avatarPublicId: publicId
        },
    });
    res.json({ message: "Avatar uploaded successfully", avatar: url });
}
export async function deleteAvatar(req, res) {
    const id = req.params["id"];
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
    }
    const updated = await prisma.user.update({
        where: { id },
        data: { avatar: null, avatarPublicId: null },
    });
    res.json({ message: "Avatar deleted successfully" });
}
export async function uploadListingPhoto(req, res) {
    const listingId = req.params["id"];
    if (!listingId) {
        return res.status(400).json({ error: "Invalid listing ID" });
    }
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
    }
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, "airbnb/listings");
    const photo = await prisma.listingPhoto.create({
        data: {
            url,
            publicId,
            listingId,
        },
    });
    res.json({ message: "Listing photo uploaded successfully", photo });
}
export async function deleteListingPhoto(req, res) {
    const id = req.params["id"];
    console.log("Deleting photo with ID:", id);
    const photo = await prisma.listingPhoto.findUnique({ where: { id: id } });
    if (!photo) {
        return res.status(404).json({ error: "Photo not found" });
    }
    if (photo.publicId) {
        await deleteFromCloudinary(photo.publicId);
    }
    await prisma.listingPhoto.delete({ where: { id: id } });
    res.json({ message: "Listing photo deleted successfully" });
}
//# sourceMappingURL=upload.controller.js.map