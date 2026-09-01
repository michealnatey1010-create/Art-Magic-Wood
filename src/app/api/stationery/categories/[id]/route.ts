import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.stationeryCategory.findUnique({
    where: { id },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });
  if (!category) return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
  return NextResponse.json(category);
}

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
    const category = await prisma.stationeryCategory.update({
      where: { id },
      data: {
        name,
        description: body.description?.trim() || null,
        icon: body.icon?.trim() || null,
        order: parseInt(body.order) || 0,
      },
    });
    return NextResponse.json(category);
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
    if (e?.code === "P2002") return NextResponse.json({ error: "اسم الفئة موجود بالفعل" }, { status: 409 });
    console.error("Update stationery category error:", e);
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
  const { searchParams } = new URL(req.url);
  const deleteProducts = searchParams.get("deleteProducts") === "true";

  try {
    if (deleteProducts) {
      await prisma.stationeryProduct.deleteMany({ where: { categoryId: id } });
    }
    await prisma.stationeryCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });
    console.error("Delete stationery category error:", e);
    return NextResponse.json({ error: "حدث خطأ أثناء حذف الفئة" }, { status: 500 });
  }
}