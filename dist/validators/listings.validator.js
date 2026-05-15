import { z } from "zod";
const emptyStringToUndefined = (value) => value === "" ? undefined : value;
const normalizeListingCoordinates = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return value;
    }
    const listing = value;
    return {
        ...listing,
        longitude: listing["longitude"] ?? listing["longtude"],
    };
};
const latitudeSchema = z.preprocess(emptyStringToUndefined, z.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional());
const longitudeSchema = z.preprocess(emptyStringToUndefined, z.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional());
const listingSchema = z.object({
    title: z.string(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().min(2, "Location is required"),
    pricePerNight: z.number().positive("Price must be a positive number"),
    guest: z.number().int().min(1, "Must allow at least 1 guest"),
    latitude: latitudeSchema,
    longitude: longitudeSchema,
    type: z.enum(["APARTMENT", "HOUSE", "VILLA", "CABIN"]),
    amenities: z.array(z.string()).min(1, "At least one amenity is required"),
});
export const createListingSchema = z.preprocess(normalizeListingCoordinates, listingSchema);
export const updateListingSchema = z.preprocess(normalizeListingCoordinates, listingSchema.partial());
//# sourceMappingURL=listings.validator.js.map