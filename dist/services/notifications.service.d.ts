import { NotificationType, type Prisma } from "@prisma/client";
type CreateNotificationInput = {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Prisma.InputJsonValue;
};
export declare function createNotification(input: CreateNotificationInput): Promise<{
    message: string;
    type: import("@prisma/client").$Enums.NotificationType;
    title: string;
    userId: string;
    id: string;
    createdAt: Date;
    data: Prisma.JsonValue | null;
    readAt: Date | null;
}>;
export declare function createNotifications(inputs: CreateNotificationInput[]): Promise<{
    message: string;
    type: import("@prisma/client").$Enums.NotificationType;
    title: string;
    userId: string;
    id: string;
    createdAt: Date;
    data: Prisma.JsonValue | null;
    readAt: Date | null;
}[]>;
export {};
//# sourceMappingURL=notifications.service.d.ts.map