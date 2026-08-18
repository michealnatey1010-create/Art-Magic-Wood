import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { token?: string; device?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token) return NextResponse.json({ error: "token مطلوب" }, { status: 400 });

  const userId = body.userId?.trim();
  if (!userId) return NextResponse.json({ error: "userId مطلوب" }, { status: 400 });

  const device = body.device?.trim() || "android";

  try {
    await prisma.fCMToken.upsert({
      where: { token },
      create: { userId, token, device },
      update: { userId, device },
    });
    return NextResponse.json({ success: true, message: "تم تسجيل الرمز بنجاح" });
  } catch (e) {
    console.error("Register token error:", e);
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الرمز" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token) return NextResponse.json({ error: "token مطلوب" }, { status: 400 });

  try {
    await prisma.fCMToken.deleteMany({ where: { token, userId: session.id } });
    return NextResponse.json({ success: true, message: "تم حذف الرمز" });
  } catch (e) {
    console.error("Delete token error:", e);
    return NextResponse.json({ error: "حدث خطأ أثناء حذف الرمز" }, { status: 500 });
  }
}
