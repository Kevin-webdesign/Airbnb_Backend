import type { Request, Response } from "express";
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { createUserSchema } from "../validators/users.validator.js";
import type { NextFunction } from "express";
import crypto from "crypto";
import { sendEmail } from "../config/email.js";
import { passwordResetEmail, welcomeEmail } from "../templates/emails.js";

configDotenv();

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createUserSchema.parse(req.body);
    const { email, username } = data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Email or username already in use" });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword },
    });

    const sendemail = welcomeEmail(user.name, user.role);
    await sendEmail(user.email, "Welcome to Airbnb!", sendemail);

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const id = (req as any).userId;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "currentPassword and newPassword are required" });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: "New password must be at least 8 characters" });
  }

  const id = (req as any).userId;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  res.json({ message: "Password changed successfully" });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  // Always return the same response — don't reveal if the email is registered
  const successResponse = {
    message: "If that email is registered, a reset link has been sent",
  };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json(successResponse);

  // Generate a raw random token — this goes in the email link
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Hash before storing — if DB is compromised, raw tokens are not exposed
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });
  const sendemail = passwordResetEmail(
    user.name,
    `http://localhost:3000/auth/reset-password/${rawToken}`,
  );

  await sendEmail(user.email, "Password Reset Request", sendemail);

  console.log(`Reset token sent to the email `);
  res.json({ successResponse, rawToken, hashedToken });
}

export async function resetPassword(req: Request, res: Response) {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }
if(typeof token !== "string") {
  return res.status(400).json({ error: "Invalid token" });
}

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  res.json({ message: "Password reset successfully" });
}
