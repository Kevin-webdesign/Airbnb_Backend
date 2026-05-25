import { NotificationType, type Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma.js";
import { createNotification, createNotifications } from "../services/notifications.service.js";
import {
  createSystemNotificationSchema,
  notificationsQuerySchema,
  registerPushTokenSchema,
} from "../validators/notifications.validator.js";

function requireAuth(req: Request, res: Response) {
  if (!req.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  return { id: req.userId, role: req.role };
}

export async function getMyNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const query = notificationsQuerySchema.parse(req.query);
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.NotificationWhereInput = {
      userId: user.id,
      ...(query.unreadOnly ? { readAt: null } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const [notifications, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);

    res.json({
      data: notifications,
      unread,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = notificationsQuerySchema.parse(req.query);
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.NotificationWhereInput = {
      ...(query.unreadOnly ? { readAt: null } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      data: notifications,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUnreadNotificationsCount(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const count = await prisma.notification.count({
      where: { userId: user.id, readAt: null },
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsRead(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const id = req.params["id"] as string;
    const notification = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { readAt: notification.readAt ?? new Date() },
    });

    res.json(updatedNotification);
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsRead(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const result = await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });

    res.json({ message: "Notifications marked as read", count: result.count });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const id = req.params["id"] as string;
    const notification = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await prisma.notification.delete({ where: { id } });

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function registerPushToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = requireAuth(req, res);
    if (!user) {
      return;
    }

    const data = registerPushTokenSchema.parse(req.body);
    const pushToken = await prisma.pushToken.upsert({
      where: { token: data.token },
      update: {
        userId: user.id,
        platform: data.platform,
      },
      create: {
        userId: user.id,
        token: data.token,
        platform: data.platform,
      },
    });

    res.status(201).json(pushToken);
  } catch (error) {
    next(error);
  }
}

export async function createSystemNotification(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createSystemNotificationSchema.parse(req.body);
    const where: Prisma.UserWhereInput = data.broadcast
      ? {}
      : {
          OR: [
            ...(data.userId ? [{ id: data.userId }] : []),
            ...(data.userIds ? data.userIds.map((id) => ({ id })) : []),
            ...(data.role ? [{ role: data.role }] : []),
          ],
        };

    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    if (!users.length) {
      return res.status(404).json({ message: "No notification recipients found" });
    }

    const notifications = await createNotifications(
      users.map((user) => {
        const notification = {
          userId: user.id,
          type: NotificationType.SYSTEM,
          title: data.title,
          message: data.message,
        };

        return data.data === undefined
          ? notification
          : { ...notification, data: data.data as Prisma.InputJsonValue };
      }),
    );

    res.status(201).json({
      message: "System notification created",
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}
