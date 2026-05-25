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
    void sendExpoPushNotifications(input.userId, {
        title: input.title,
        body: input.message,
        data: {
            notificationId: notification.id,
            type: notification.type,
            ...(notification.data && typeof notification.data === "object" && !Array.isArray(notification.data)
                ? notification.data
                : {}),
        },
    });
    return notification;
}
export async function createNotifications(inputs) {
    return Promise.all(inputs.map((input) => createNotification(input)));
}
async function sendExpoPushNotifications(userId, message) {
    try {
        const tokens = await prisma.pushToken.findMany({
            where: { userId },
            select: { token: true },
        });
        const expoMessages = tokens
            .filter(({ token }) => token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken["))
            .map(({ token }) => ({
            to: token,
            sound: "default",
            title: message.title,
            body: message.body,
            data: {
                url: "/(tabs)/messages",
                ...message.data,
            },
        }));
        if (!expoMessages.length) {
            return;
        }
        await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(expoMessages),
        });
    }
    catch (error) {
        console.error("Unable to send push notification:", error);
    }
}
//# sourceMappingURL=notifications.service.js.map