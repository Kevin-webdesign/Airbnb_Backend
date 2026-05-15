import { z } from "zod";
export const createMessageSchema = z.object({
    content: z.string().trim().min(1, "Message cannot be empty").max(2000),
    receiverId: z.string().uuid().optional(),
});
export const listingMessagesQuerySchema = z.object({
    guestId: z.string().uuid().optional(),
});
//# sourceMappingURL=messages.validator.js.map