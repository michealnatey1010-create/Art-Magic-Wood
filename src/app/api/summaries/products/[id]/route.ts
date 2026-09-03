import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const summary = await prisma.externalSummary.findUnique({
    where: { id },
    include: { subject: { include: { grade: { include: { level: true } } } } },
  });
  if (!summary) return NextResponse.json({ error: "الملخص غير موجود" }, { status: 404 });
  return NextResponse.json(summary);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "اسم الملخص مطلوب" }, { status: 400 });

  const existing = await prisma.externalSummary.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "الملخص غير موجود" }, { status: 404 });

  const data: any = {
    name,
    description: body.description?.trim() || null,
    price: parseFloat(body.price) || 0,
    image: typeof body.image === "string" ? body.image || null : null,
    stock: parseInt(body.stock) || 0,
  };
  if (body.subjectId) {
    const subject = await prisma.subject.findUnique({ where: { id: body.subjectId } });
    if (!subject) return NextResponse.json({ error: "المادة غير موجودة" }, { status: 404 });
    data.subjectId = body.subjectId;
  }

  try {
    const summary = await prisma.externalSummary.update({ where: { id }, data });
    return NextResponse.json(summary);
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "الملخص غير موجود" }, { status: 404 });
    console.error("Update summary error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.externalSummary.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "الملخص غير موجود" }, { status: 404 });
    console.error("Delete summary error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}