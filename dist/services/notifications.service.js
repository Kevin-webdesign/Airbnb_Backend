import { NotificationType } from "@prisma/client";
import prisma from "../config/prisma.js";
import { emitNotificationCreated } from "../config/socket.js";
export async function createNotification(input) {
    const notification = await prisma.notification.create({
        data: {
            userId: input.userId,
            type: input.type,
            title: input.title,
            message: input.message,
            ...(input.data === undefined ? {} : { data: input.data }),
        },
    });
    emitNotificationCreated(notification);
    return notification;
}
export async function createNotifications(inputs) {
    return Promise.all(inputs.map((input) => createNotification(input)));
}
//# sourceMappingURL=notifications.service.js.map