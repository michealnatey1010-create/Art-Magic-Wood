import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId, active } = await req.json();
    if (!userId || typeof active !== "boolean") {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    if (!user.referralCode) {
      return NextResponse.json({ error: "هذا المستخدم ليس لديه كود إحالة" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { referralActive: active },
    });

    return NextResponse.json({ success: true, referralActive: active });
  } catch (e) {
    console.error("Toggle referral error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
