import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const subjects = await prisma.subject.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { grade: { include: { level: true } }, summaries: { orderBy: { createdAt: "desc" } } },
  });
  return NextResponse.json(subjects);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "اسم المادة مطلوب" }, { status: 400 });
  if (!body.gradeId) return NextResponse.json({ error: "الصف مطلوب" }, { status: 400 });

  const grade = await prisma.grade.findUnique({ where: { id: body.gradeId } });
  if (!grade) return NextResponse.json({ error: "الصف غير موجود" }, { status: 404 });

  try {
    const subject = await prisma.subject.create({
      data: { name, gradeId: body.gradeId, order: parseInt(body.order) || 0 },
    });
    return NextResponse.json(subject, { status: 201 });
  } catch (e) {
    console.error("Create subject error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}