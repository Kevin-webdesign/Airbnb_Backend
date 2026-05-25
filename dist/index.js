import "dotenv/config";
import express, {} from "express";
import { createServer } from "node:http";
import compression from "compression";
import cors, {} from "cors";
import { generalLimiter, strictLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { connectDB } from "./config/prisma.js";
import { setupSwagger } from "./config/swagger.js";
import v1Router from "./routes/v1/index.js";
import morgan from "morgan";
import { deprecateV1 } from "./middlewares/deprecation.middleware.js";
import { initializeSocket } from "./config/socket.js";
const app = express();
const PORT = Number(process.env["PORT"]) || 3000;
const server = createServer(app);
const configuredOrigins = (process.env["CORS_ORIGINS"] || process.env["FRONTEND_URL"] || "http://localhost:5173" || "http://localhost:8081")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedOrigins = Array.from(new Set([
    ...configuredOrigins,
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
]));
const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(compression());
// Apply general limiter to all routes
app.use(generalLimiter);
// Apply strict limiter to POST routes
app.use((req, res, next) => {
    if (req.method === 'POST') {
        return strictLimiter(req, res, next);
    }
    next();
});
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date()
    });
});
app.use("/api/v1", deprecateV1, v1Router);
setupSwagger(app);
app.use(process.env["NODE_ENV"] === "production" ? morgan("combined") : morgan("dev"));
app.use(errorHandler);
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong" });
});
async function startServer() {
    try {
        await connectDB();
        initializeSocket(server, allowedOrigins);
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map