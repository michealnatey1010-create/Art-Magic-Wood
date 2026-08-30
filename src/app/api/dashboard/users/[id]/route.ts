import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
  }

  const { id } = await params;

  try {
    if (id === session.id) {
      return NextResponse.json({ error: "لا يمكنك حذف حسابك الحالي" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    if (existing.email?.toLowerCase() === "admin@school.com") {
      return NextResponse.json({ error: "لا يمكن حذف حساب المشرف العام" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "تم حذف الحساب" });
  } catch (e) {
    console.error("Delete user error:", e);
    return NextResponse.json({ error: "حدث خطأ أثناء حذف الحساب" }, { status: 500 });
  }
}