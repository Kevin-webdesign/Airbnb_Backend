import type { Request, Response } from "express";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary.js";
import prisma from "../config/prisma.js";

const MAX_LISTING_PHOTOS = 7;

async function canManageListingPhotos(req: Request, listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, hostId: true },
  });

  if (!listing) {
    return { allowed: false, status: 404, error: "Listing not found" };
  }

  if (listing.hostId !== req.userId && req.role !== "ADMIN") {
    return {
      allowed: false,
      status: 403,
      error: "You can only upload photos for your own listings",
    };
  }

  return { allowed: true, listing };
}



export async function uploadAvatar(req: Request, res: Response) {
  const id = req.params["id"] as string;


  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Upload the buffer to Cloudinary under the "airbnb/avatars" folder
  const { url, publicId } = await uploadToCloudinary(
    req.file.buffer,
    "airbnb/avatars"
  );

  // Save the Cloudinary URL to the user's record in the database
  const updated = await prisma.user.update({
    where: { id },
    data: { avatar: url ,
        avatarPublicId: publicId
     },
  });

  res.json({ message: "Avatar uploaded successfully", avatar: url });
}

export async function deleteAvatar(req: Request, res: Response) {
  const id = req.params["id"] as string;
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

export async function uploadListingPhoto(req: Request, res: Response) {
  const listingId = req.params["id"] as string;

  if (!listingId) {
    return res.status(400).json({ error: "Invalid listing ID" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const permission = await canManageListingPhotos(req, listingId);
  if (!permission.allowed) {
    return res.status(permission.status ?? 500).json({ error: permission.error });
  }

  const photoCount = await prisma.listingPhoto.count({ where: { listingId } });
  if (photoCount >= MAX_LISTING_PHOTOS) {
    return res.status(400).json({
      error: `A listing can have a maximum of ${MAX_LISTING_PHOTOS} photos`,
    });
  }

  const { url, publicId } = await uploadToCloudinary(
    req.file.buffer,
    "airbnb/listings"
  );

  const photo = await prisma.listingPhoto.create({
    data: {
      url,
      publicId,
      listingId,
    },
  });
  res.json({ message: "Listing photo uploaded successfully", photo });
}

export async function uploadListingPhotos(req: Request, res: Response) {
  const listingId = req.params["id"] as string;
  const files = req.files as Express.Multer.File[] | undefined;

  if (!listingId) {
    return res.status(400).json({ error: "Invalid listing ID" });
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  if (files.length > MAX_LISTING_PHOTOS) {
    return res.status(400).json({
      error: `You can upload a maximum of ${MAX_LISTING_PHOTOS} photos at once`,
    });
  }

  const permission = await canManageListingPhotos(req, listingId);
  if (!permission.allowed) {
    return res.status(permission.status ?? 500).json({ error: permission.error });
  }

  const existingPhotoCount = await prisma.listingPhoto.count({
    where: { listingId },
  });
  if (existingPhotoCount + files.length > MAX_LISTING_PHOTOS) {
    return res.status(400).json({
      error: `A listing can have a maximum of ${MAX_LISTING_PHOTOS} photos`,
      remainingSlots: Math.max(MAX_LISTING_PHOTOS - existingPhotoCount, 0),
    });
  }

  const uploaded = await Promise.all(
    files.map((file) => uploadToCloudinary(file.buffer, "airbnb/listings")),
  );

  const photos = await prisma.$transaction(
    uploaded.map(({ url, publicId }) =>
      prisma.listingPhoto.create({
        data: {
          url,
          publicId,
          listingId,
        },
      }),
    ),
  );

  res.status(201).json({
    message: "Listing photos uploaded successfully",
    photos,
  });
}

export async function deleteListingPhoto(req: Request, res: Response) {
 const id = req.params["id"] as string;
  console.log("Deleting photo with ID:", id);
  
  const photo = await prisma.listingPhoto.findUnique({
    where: { id: id },
    include: {
      listing: {
        select: { hostId: true },
      },
    },
  });

    if (!photo) {
    return res.status(404).json({ error: "Photo not found" });
  }

  if (photo.listing.hostId !== req.userId && req.role !== "ADMIN") {
    return res.status(403).json({
      error: "You can only delete photos from your own listings",
    });
  }

  if (photo.publicId) {
    await deleteFromCloudinary(photo.publicId);
  }

    await prisma.listingPhoto.delete({ where: { id: id } });
    res.json({ message: "Listing photo deleted successfully" });
}
