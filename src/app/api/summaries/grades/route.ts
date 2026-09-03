import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const grades = await prisma.grade.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      level: true,
      subjects: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], include: { summaries: true } },
    },
  });
  return NextResponse.json(grades);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "اسم الصف مطلوب" }, { status: 400 });
  if (!body.levelId) return NextResponse.json({ error: "المرحلة مطلوبة" }, { status: 400 });

  const level = await prisma.academicLevel.findUnique({ where: { id: body.levelId } });
  if (!level) return NextResponse.json({ error: "المرحلة غير موجودة" }, { status: 404 });

  try {
    const grade = await prisma.grade.create({
      data: { name, levelId: body.levelId, order: parseInt(body.order) || 0 },
    });
    return NextResponse.json(grade, { status: 201 });
  } catch (e) {
    console.error("Create grade error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}