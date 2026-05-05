import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import type { NextFunction , Request , Response } from "express";
interface AuthRequest extends Request {
  userId: string;
  role: string;
}
configDotenv();

const JWT_SECRET = process.env.JWT_SECRET as string;


export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
    if (!token) {   
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// ─── requireHost ──────────────────────────────────────────────────────────────
// Must run after authenticate.
// Returns 403 if the user's role is not HOST.

export function requireHost(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.role !== "HOST") {
    return res.status(403).json({ error: "Only hosts can perform this action" });
  }
  next();
}

// ─── requireGuest ─────────────────────────────────────────────────────────────
// Must run after authenticate.
// Returns 403 if the user's role is not GUEST.

export function requireGuest(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.role !== "GUEST") {
    return res.status(403).json({ error: "Only guests can perform this action" });
  }
  next();
}

export function authorize(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
}}

  