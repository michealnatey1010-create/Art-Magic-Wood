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
    const existing = await prisma.subscription.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "الاشتراك غير موجود" }, { status: 404 });
    }

    await prisma.subscription.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "تم حذف الاشتراك" });
  } catch (e) {
    console.error("Delete subscription error:", e);
    return NextResponse.json({ error: "حدث خطأ أثناء حذف الاشتراك" }, { status: 500 });
  }
}