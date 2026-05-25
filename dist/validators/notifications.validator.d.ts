import { z } from "zod";
export declare const notificationsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    unreadOnly: z.ZodPipe<z.ZodOptional<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>, z.ZodTransform<boolean, "true" | "false" | undefined>>;
    type: z.ZodOptional<z.ZodEnum<{
        SYSTEM: "SYSTEM";
        MESSAGE: "MESSAGE";
        BOOKING_CREATED: "BOOKING_CREATED";
        BOOKING_CONFIRMED: "BOOKING_CONFIRMED";
        BOOKING_CANCELLED: "BOOKING_CANCELLED";
        LISTING: "LISTING";
        REVIEW: "REVIEW";
    }>>;
}, z.core.$strip>;
export declare const createSystemNotificationSchema: z.ZodObject<{
    title: z.ZodString;
    message: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    userIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    role: z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        GUEST: "GUEST";
        HOST: "HOST";
    }>>;
    broadcast: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
//# sourceMappingURL=notifications.validator.d.ts.map