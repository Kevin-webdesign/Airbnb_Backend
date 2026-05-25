import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
export declare function initializeSocket(server: HttpServer, allowedOrigins: string[]): Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare function emitMessageCreated(message: {
    listingId: string;
    senderId: string;
    receiverId: string;
}): void;
export declare function emitNotificationCreated(notification: {
    userId: string;
}): void;
export declare function emitDataChanged(channel: string, payload: unknown): void;
//# sourceMappingURL=socket.d.ts.map