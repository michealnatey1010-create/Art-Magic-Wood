import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const summaries = await prisma.externalSummary.findMany({
    orderBy: { createdAt: "desc" },
    include: { subject: { include: { grade: { include: { level: true } } } } },
  });
  return NextResponse.json(summaries);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "اسم الملخص مطلوب" }, { status: 400 });
  if (!body.subjectId) return NextResponse.json({ error: "المادة مطلوبة" }, { status: 400 });

  const subject = await prisma.subject.findUnique({ where: { id: body.subjectId } });
  if (!subject) return NextResponse.json({ error: "المادة غير موجودة" }, { status: 404 });

  try {
    const summary = await prisma.externalSummary.create({
      data: {
        name,
        description: body.description?.trim() || null,
        price: parseFloat(body.price) || 0,
        image: typeof body.image === "string" ? body.image || null : null,
        stock: parseInt(body.stock) || 0,
        subjectId: body.subjectId,
      },
    });
    return NextResponse.json(summary, { status: 201 });
  } catch (e) {
    console.error("Create summary error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}