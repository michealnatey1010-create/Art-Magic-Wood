import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const PRODUCT_TYPES = ["STAGE", "PREORDER", "TEACHER_PACKAGE"];

async function resolveProduct(productId: string, productType: string): Promise<{ name: string; price: number; image?: string } | null> {
  if (productType === "STAGE") {
    const p = await prisma.stage.findUnique({ where: { id: productId } });
    return p ? { name: p.name, price: p.price, image: p.coverImage || undefined } : null;
  }
  if (productType === "PREORDER") {
    const p = await prisma.preorderProduct.findUnique({ where: { id: productId } });
    return p ? { name: p.name, price: p.price, image: p.image || undefined } : null;
  }
  if (productType === "TEACHER_PACKAGE") {
    const p = await prisma.teacherPackage.findUnique({ where: { id: productId } });
    return p ? { name: p.name, price: p.monthly_price, image: p.image || undefined } : null;
  }
  return null;
}

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return cart;
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cart = await prisma.cart.findUnique({
    where: { userId: session.id },
    include: { items: { orderBy: { created_at: "asc" } } },
  });

  const rawItems = cart?.items || [];

  const stageIds = rawItems.filter((i) => i.productType === "STAGE").map((i) => i.productId);
  const preorderIds = rawItems.filter((i) => i.productType === "PREORDER").map((i) => i.productId);
  const teacherIds = rawItems.filter((i) => i.productType === "TEACHER_PACKAGE").map((i) => i.productId);

  const [stages, preorders, teachers] = await Promise.all([
    stageIds.length ? prisma.stage.findMany({ where: { id: { in: stageIds } }, select: { id: true, coverImage: true } }) : [],
    preorderIds.length ? prisma.preorderProduct.findMany({ where: { id: { in: preorderIds } }, select: { id: true, image: true } }) : [],
    teacherIds.length ? prisma.teacherPackage.findMany({ where: { id: { in: teacherIds } }, select: { id: true, image: true } }) : [],
  ]);

  const imageMap = new Map<string, string>();
  stages.forEach((s) => { if (s.coverImage) imageMap.set(`STAGE:${s.id}`, s.coverImage); });
  preorders.forEach((p) => { if (p.image) imageMap.set(`PREORDER:${p.id}`, p.image); });
  teachers.forEach((t) => { if (t.image) imageMap.set(`TEACHER_PACKAGE:${t.id}`, t.image); });

  const items = rawItems.map((i) => ({
    id: i.id,
    productId: i.productId,
    productType: i.productType,
    productName: i.productName,
    price: i.price,
    quantity: i.quantity,
    image: imageMap.get(`${i.productType}:${i.productId}`) || null,
  }));

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return NextResponse.json({ success: true, data: { items, total, itemCount: items.length } });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { productId, productType, quantity } = await req.json();
    if (!productId || !productType) {
      return NextResponse.json({ success: false, message: "productId و productType مطلوبان" }, { status: 400 });
    }
    if (!PRODUCT_TYPES.includes(productType)) {
      return NextResponse.json({ success: false, message: "productType غير صالح" }, { status: 400 });
    }

    const product = await resolveProduct(productId, productType);
    if (!product) {
      return NextResponse.json({ success: false, message: "المنتج غير موجود" }, { status: 404 });
    }

    const qty = Math.max(1, parseInt(quantity) || 1);
    const cart = await getOrCreateCart(session.id);

    const existing = await prisma.cartItem.findFirst({
      where: { cart_id: cart.id, productId, productType },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + qty, price: product.price, productName: product.name },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cart_id: cart.id,
          productId,
          productType,
          productName: product.name,
          price: product.price,
          quantity: qty,
        },
      });
    }

    return NextResponse.json({ success: true, message: "تمت إضافة المنتج إلى السلة", image: product.image || null }, { status: 201 });
  } catch (e) {
    console.error("Add to cart error:", e);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء إضافة المنتج" }, { status: 500 });
  }
}