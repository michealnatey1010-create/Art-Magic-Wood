import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") || undefined;
  const products = await prisma.stationeryProduct.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "اسم المنتج مطلوب" }, { status: 400 });
  if (!body.categoryId) return NextResponse.json({ error: "الفئة مطلوبة" }, { status: 400 });

  const category = await prisma.stationeryCategory.findUnique({ where: { id: body.categoryId } });
  if (!category) return NextResponse.json({ error: "الفئة غير موجودة" }, { status: 404 });

  const product = await prisma.stationeryProduct.create({
    data: {
      name,
      description: body.description?.trim() || null,
      price: parseFloat(body.price) || 0,
      image: typeof body.image === "string" ? body.image || null : null,
      stock: parseInt(body.stock) || 0,
      categoryId: body.categoryId,
    },
  });
  return NextResponse.json(product, { status: 201 });
}