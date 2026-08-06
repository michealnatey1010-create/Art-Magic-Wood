import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;

  try {
    const cart = await prisma.cart.findUnique({ where: { userId: session.id } });
    if (!cart) return NextResponse.json({ success: false, message: "السلة فارغة" }, { status: 404 });

    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cart_id: cart.id } });
    if (!item) return NextResponse.json({ success: false, message: "العنصر غير موجود" }, { status: 404 });

    await prisma.cartItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true, message: "تم حذف العنصر من السلة" });
  } catch (e) {
    console.error("Delete cart item error:", e);
    return NextResponse.json({ success: false, message: "فشل حذف العنصر" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;

  try {
    const { quantity } = await req.json();
    const qty = parseInt(quantity);
    if (!qty || qty < 1) {
      return NextResponse.json({ success: false, message: "الكمية يجب أن تكون 1 على الأقل" }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({ where: { userId: session.id } });
    if (!cart) return NextResponse.json({ success: false, message: "السلة فارغة" }, { status: 404 });

    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cart_id: cart.id } });
    if (!item) return NextResponse.json({ success: false, message: "العنصر غير موجود" }, { status: 404 });

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: qty } });
    return NextResponse.json({ success: true, message: "تم تحديث الكمية" });
  } catch (e) {
    console.error("Update cart item error:", e);
    return NextResponse.json({ success: false, message: "فشل تحديث الكمية" }, { status: 500 });
  }
}