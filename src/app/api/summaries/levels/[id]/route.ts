import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const level = await prisma.academicLevel.findUnique({
    where: { id },
    include: {
      grades: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], include: { subjects: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], include: { summaries: true } } } },
    },
  });
  if (!level) return NextResponse.json({ error: "المرحلة غير موجودة" }, { status: 404 });
  return NextResponse.json(level);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "اسم المرحلة مطلوب" }, { status: 400 });

  try {
    const level = await prisma.academicLevel.update({
      where: { id },
      data: { name, order: parseInt(body.order) || 0 },
    });
    return NextResponse.json(level);
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "المرحلة غير موجودة" }, { status: 404 });
    if (e?.code === "P2002") return NextResponse.json({ error: "اسم المرحلة موجود بالفعل" }, { status: 409 });
    console.error("Update level error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.academicLevel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "المرحلة غير موجودة" }, { status: 404 });
    console.error("Delete level error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}