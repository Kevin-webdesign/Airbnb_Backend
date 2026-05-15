import { z } from "zod";
export declare const createMessageSchema: z.ZodObject<{
    content: z.ZodString;
    receiverId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const listingMessagesQuerySchema: z.ZodObject<{
    guestId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=messages.validator.d.ts.map