import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const levels = await prisma.academicLevel.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      grades: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: {
          subjects: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            include: { summaries: true },
          },
        },
      },
    },
  });
  return NextResponse.json(levels);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "اسم المرحلة مطلوب" }, { status: 400 });

  try {
    const level = await prisma.academicLevel.create({
      data: { name, order: parseInt(body.order) || 0 },
    });
    return NextResponse.json(level, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "اسم المرحلة موجود بالفعل" }, { status: 409 });
    console.error("Create level error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}