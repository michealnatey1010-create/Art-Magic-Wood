import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const existing = await prisma.merchantInventory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "السجل غير موجود" }, { status: 404 });
    }

    await prisma.merchantInventory.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "تم الحذف بنجاح" });
  } catch (e) {
    console.error("Delete inventory error:", e);
    return NextResponse.json({ success: false, message: "فشل الحذف" }, { status: 500 });
  }
}