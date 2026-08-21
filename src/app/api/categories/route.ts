import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { stages: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "اسم الفئة مطلوب" }, { status: 400 });

  try {
    const category = await prisma.category.create({
      data: {
        name,
        icon: body.icon?.trim() || null,
        order: parseInt(body.order) || 0,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "اسم الفئة موجود بالفعل" }, { status: 409 });
    }
    console.error("Create category error:", e);
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء الفئة" }, { status: 500 });
  }
}
