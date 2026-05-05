import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();
const JWT_SECRET = process.env.JWT_SECRET;
export function authenticate(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
}
// ─── requireHost ──────────────────────────────────────────────────────────────
// Must run after authenticate.
// Returns 403 if the user's role is not HOST.
export function requireHost(req, res, next) {
    if (req.role !== "HOST") {
        return res.status(403).json({ error: "Only hosts can perform this action" });
    }
    next();
}
// ─── requireGuest ─────────────────────────────────────────────────────────────
// Must run after authenticate.
// Returns 403 if the user's role is not GUEST.
export function requireGuest(req, res, next) {
    if (req.role !== "GUEST") {
        return res.status(403).json({ error: "Only guests can perform this action" });
    }
    next();
}
export function authorize(roles) {
    return (req, res, next) => {
        if (!roles.includes(req.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
}
//# sourceMappingURL=auth.middleware.js.map