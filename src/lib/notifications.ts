import prisma from "@/lib/prisma";
import { sendNotificationToMultipleTokens } from "@/lib/fcm";

export async function notifyUsers(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (unique.length === 0) return;

  const tokens = await prisma.fCMToken.findMany({
    where: { userId: { in: unique } },
  });

  return sendNotificationToMultipleTokens(
    tokens.map((t) => t.token),
    title,
    body,
    data
  );
}

export async function notifyAllUsers(title: string, body: string, data?: Record<string, string>) {
  const tokens = await prisma.fCMToken.findMany();
  return sendNotificationToMultipleTokens(
    tokens.map((t) => t.token),
    title,
    body,
    data
  );
}
