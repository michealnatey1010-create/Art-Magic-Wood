import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const notifications = await prisma.notification.findMany({
    where: { status: "active" },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json({ success: true, data: notifications });
}