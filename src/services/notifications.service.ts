import { NotificationType, type Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { emitNotificationCreated } from "../config/socket.js";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Prisma.InputJsonValue;
};

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      ...(input.data === undefined ? {} : { data: input.data }),
    },
  });

  emitNotificationCreated(notification);

  return notification;
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  return Promise.all(inputs.map((input) => createNotification(input)));
}
