import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: { grade: { include: { level: true } }, summaries: { orderBy: { createdAt: "desc" } } },
  });
  if (!subject) return NextResponse.json({ error: "المادة غير موجودة" }, { status: 404 });
  return NextResponse.json(subject);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "اسم المادة مطلوب" }, { status: 400 });

  const data: any = { name, order: parseInt(body.order) || 0 };
  if (body.gradeId) {
    const grade = await prisma.grade.findUnique({ where: { id: body.gradeId } });
    if (!grade) return NextResponse.json({ error: "الصف غير موجود" }, { status: 404 });
    data.gradeId = body.gradeId;
  }

  try {
    const subject = await prisma.subject.update({ where: { id }, data });
    return NextResponse.json(subject);
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "المادة غير موجودة" }, { status: 404 });
    console.error("Update subject error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "المادة غير موجودة" }, { status: 404 });
    console.error("Delete subject error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}