import jwt from "jsonwebtoken";
import { Server } from "socket.io";
let io = null;
function authenticateSocket(socket, next) {
    const token = socket.handshake.auth["token"];
    if (typeof token !== "string") {
        return next(new Error("No token provided"));
    }
    try {
        const decoded = jwt.verify(token, process.env["JWT_SECRET"]);
        socket.data["userId"] = decoded.userId;
        socket.data["role"] = decoded.role;
        next();
    }
    catch {
        next(new Error("Invalid token"));
    }
}
export function initializeSocket(server, allowedOrigins) {
    io = new Server(server, {
        cors: {
            origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
            credentials: true,
        },
    });
    io.use(authenticateSocket);
    io.on("connection", (socket) => {
        const userId = socket.data["userId"];
        if (typeof userId === "string") {
            socket.join(`user:${userId}`);
        }
        socket.on("listing:join", (listingId) => {
            if (listingId) {
                socket.join(`listing:${listingId}`);
            }
        });
        socket.on("listing:leave", (listingId) => {
            if (listingId) {
                socket.leave(`listing:${listingId}`);
            }
        });
    });
    return io;
}
export function emitMessageCreated(message) {
    if (!io) {
        return;
    }
    io.to(`user:${message.senderId}`)
        .to(`user:${message.receiverId}`)
        .to(`listing:${message.listingId}`)
        .emit("message:created", message);
}
export function emitNotificationCreated(notification) {
    io?.to(`user:${notification.userId}`).emit("notification:created", notification);
}
export function emitDataChanged(channel, payload) {
    io?.emit("data:changed", { channel, payload, at: new Date().toISOString() });
}
//# sourceMappingURL=socket.js.map