import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const existing = await prisma.packageProposal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "الاقتراح غير موجود" }, { status: 404 });
    }

    await prisma.packageProposal.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "تم حذف الاقتراح" });
  } catch {
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء حذف الاقتراح" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { status } = await req.json();
    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "حالة غير صالحة" },
        { status: 400 }
      );
    }

    const existing = await prisma.packageProposal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "الاقتراح غير موجود" }, { status: 404 });
    }

    await prisma.packageProposal.update({ where: { id }, data: { status } });

    return NextResponse.json({ success: true, message: "تم تحديث الحالة" });
  } catch {
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تحديث الحالة" }, { status: 500 });
  }
}