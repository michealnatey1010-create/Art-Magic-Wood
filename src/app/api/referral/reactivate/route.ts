import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const isAdmin = (session.role || "").toUpperCase() === "ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json().catch(() => ({}));
    const { referralId } = body;
    if (!referralId) {
      return NextResponse.json({ error: "referralId مطلوب" }, { status: 400 });
    }

    const referral = await prisma.referral.findUnique({ where: { id: referralId } });
    if (!referral) {
      return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
    }

    if (referral.status === "pending") {
      return NextResponse.json(
        { error: "لا يمكن إعادة التفعيل بينما الطلب قيد المعالجة" },
        { status: 422 }
      );
    }

    if (referral.status === "reactivated") {
      return NextResponse.json({ success: true, message: "تم إعادة تفعيل الاستخدام مسبقاً" });
    }

    await prisma.referral.update({
      where: { id: referral.id },
      data: { status: "reactivated" },
    });

    return NextResponse.json({
      success: true,
      message: "تم إعادة تفعيل استخدام الكود لهذا الطالب",
    });
  } catch (e) {
    console.error("Reactivate referral error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}