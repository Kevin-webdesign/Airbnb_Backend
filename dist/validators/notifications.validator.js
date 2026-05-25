import { NotificationType, Role } from "@prisma/client";
import { z } from "zod";
export const notificationsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    unreadOnly: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
    type: z.enum(NotificationType).optional(),
});
export const createSystemNotificationSchema = z
    .object({
    title: z.string().trim().min(1).max(120),
    message: z.string().trim().min(1).max(1000),
    userId: z.string().uuid().optional(),
    userIds: z.array(z.string().uuid()).min(1).optional(),
    role: z.enum(Role).optional(),
    broadcast: z.boolean().optional().default(false),
    data: z.record(z.string(), z.unknown()).optional(),
})
    .refine((data) => Boolean(data.userId) ||
    Boolean(data.userIds?.length) ||
    Boolean(data.role) ||
    data.broadcast, {
    message: "Provide userId, userIds, role, or broadcast",
    path: ["userId"],
});
//# sourceMappingURL=notifications.validator.js.map