import "dotenv/config";
import express, {} from "express";
import compression from "compression";
import { generalLimiter, strictLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { connectDB } from "./config/prisma.js";
import { setupSwagger } from "./config/swagger.js";
import v1Router from "./routes/v1/index.js";
import morgan from "morgan";
const app = express();
const PORT = Number(process.env["PORT"]) || 3000;
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
app.use("/api/v1", v1Router);
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
        app.listen(PORT, () => {
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