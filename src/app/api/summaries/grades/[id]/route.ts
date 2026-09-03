import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const grade = await prisma.grade.findUnique({
    where: { id },
    include: { level: true, subjects: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], include: { summaries: true } } },
  });
  if (!grade) return NextResponse.json({ error: "الصف غير موجود" }, { status: 404 });
  return NextResponse.json(grade);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "اسم الصف مطلوب" }, { status: 400 });

  const data: any = { name, order: parseInt(body.order) || 0 };
  if (body.levelId) {
    const level = await prisma.academicLevel.findUnique({ where: { id: body.levelId } });
    if (!level) return NextResponse.json({ error: "المرحلة غير موجودة" }, { status: 404 });
    data.levelId = body.levelId;
  }

  try {
    const grade = await prisma.grade.update({ where: { id }, data });
    return NextResponse.json(grade);
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "الصف غير موجود" }, { status: 404 });
    console.error("Update grade error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.grade.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "الصف غير موجود" }, { status: 404 });
    console.error("Delete grade error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}