import { z } from "zod";
export declare const createListingSchema: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    location: z.ZodString;
    pricePerNight: z.ZodNumber;
    guest: z.ZodNumber;
    latitude: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    longitude: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    type: z.ZodEnum<{
        APARTMENT: "APARTMENT";
        HOUSE: "HOUSE";
        VILLA: "VILLA";
        CABIN: "CABIN";
    }>;
    amenities: z.ZodArray<z.ZodString>;
}, z.core.$strip>>;
export declare const updateListingSchema: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    pricePerNight: z.ZodOptional<z.ZodNumber>;
    guest: z.ZodOptional<z.ZodNumber>;
    latitude: z.ZodOptional<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodCoercedNumber<unknown>>>>;
    longitude: z.ZodOptional<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodCoercedNumber<unknown>>>>;
    type: z.ZodOptional<z.ZodEnum<{
        APARTMENT: "APARTMENT";
        HOUSE: "HOUSE";
        VILLA: "VILLA";
        CABIN: "CABIN";
    }>>;
    amenities: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>>;
//# sourceMappingURL=listings.validator.d.ts.map