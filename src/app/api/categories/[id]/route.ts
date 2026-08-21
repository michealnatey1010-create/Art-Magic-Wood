import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "اسم الفئة مطلوب" }, { status: 400 });

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        icon: body.icon?.trim() || null,
        order: parseInt(body.order) || 0,
      },
    });
    return NextResponse.json(category);
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "اسم الفئة موجود بالفعل" }, { status: 409 });
    }
    console.error("Update category error:", e);
    return NextResponse.json({ error: "حدث خطأ أثناء تعديل الفئة" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
    }
    console.error("Delete category error:", e);
    return NextResponse.json({ error: "حدث خطأ أثناء حذف الفئة" }, { status: 500 });
  }
}
