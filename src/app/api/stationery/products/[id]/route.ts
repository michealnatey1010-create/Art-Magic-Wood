import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.stationeryProduct.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  return NextResponse.json(product);
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
  if (!name) return NextResponse.json({ error: "اسم المنتج مطلوب" }, { status: 400 });

  const existing = await prisma.stationeryProduct.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });

  const data: any = {
    name,
    description: body.description?.trim() || null,
    price: parseFloat(body.price) || 0,
    image: typeof body.image === "string" ? body.image || null : null,
    stock: parseInt(body.stock) || 0,
  };
  if (body.categoryId) data.categoryId = body.categoryId;

  const product = await prisma.stationeryProduct.update({ where: { id }, data });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.stationeryProduct.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    console.error("Delete stationery product error:", e);
    return NextResponse.json({ error: "حدث خطأ أثناء حذف المنتج" }, { status: 500 });
  }
}