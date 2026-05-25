import jwt from "jsonwebtoken";
import { Server, type Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";

let io: Server | null = null;

function authenticateSocket(socket: Socket, next: (error?: Error) => void) {
  const token = socket.handshake.auth["token"];

  if (typeof token !== "string") {
    return next(new Error("No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env["JWT_SECRET"] as string) as {
      userId: string;
      role: string;
    };
    socket.data["userId"] = decoded.userId;
    socket.data["role"] = decoded.role;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
}

export function initializeSocket(server: HttpServer, allowedOrigins: string[]) {
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

    socket.on("listing:join", (listingId: string) => {
      if (listingId) {
        socket.join(`listing:${listingId}`);
      }
    });

    socket.on("listing:leave", (listingId: string) => {
      if (listingId) {
        socket.leave(`listing:${listingId}`);
      }
    });
  });

  return io;
}

export function emitMessageCreated(message: {
  listingId: string;
  senderId: string;
  receiverId: string;
}) {
  if (!io) {
    return;
  }

  io.to(`user:${message.senderId}`)
    .to(`user:${message.receiverId}`)
    .to(`listing:${message.listingId}`)
    .emit("message:created", message);
}

export function emitNotificationCreated(notification: { userId: string }) {
  io?.to(`user:${notification.userId}`).emit("notification:created", notification);
}

export function emitDataChanged(channel: string, payload: unknown) {
  io?.emit("data:changed", { channel, payload, at: new Date().toISOString() });
}
