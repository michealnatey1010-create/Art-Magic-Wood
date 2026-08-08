import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const { usePoints, receiptImage } = body;
    const pointsValue = parseInt(usePoints) || 0;

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });

    const cart = await prisma.cart.findUnique({
      where: { userId: session.id },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, message: "السلة فارغة" }, { status: 400 });
    }

    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    if (pointsValue > user.points) {
      return NextResponse.json({ success: false, message: "رصيد نقاط غير كافٍ" }, { status: 400 });
    }
    const pointsToUse = Math.min(pointsValue, Math.floor(total));
    const finalPrice = total - pointsToUse;
    const pointsEarned = Math.floor(total / 10);
    const newBalance = user.points - pointsToUse + pointsEarned;

    await prisma.$transaction([
      prisma.order.create({
        data: {
          userId: session.id,
          source: "cart",
          itemId: cart.id,
          itemName: `سلة تسوق (${cart.items.length} منتجات)`,
          price: total,
          discount: pointsToUse,
          pointsUsed: pointsToUse,
          pointsEarned,
          receiptImage: receiptImage || null,
          status: "pending",
          items: {
            create: cart.items.map((i) => ({
              productName: i.productName,
              price: i.price,
              quantity: i.quantity,
            })),
          },
        },
      }),
      prisma.cartItem.deleteMany({ where: { cart_id: cart.id } }),
      prisma.user.update({
        where: { id: session.id },
        data: { points: newBalance },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "تم إتمام الطلب بنجاح",
      data: {
        orderTotal: total,
        discount: pointsToUse,
        finalPrice,
        pointsUsed: pointsToUse,
        pointsEarned,
        newBalance,
      },
    }, { status: 201 });
  } catch (e) {
    console.error("Cart checkout error:", e);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء إتمام الطلب" }, { status: 500 });
  }
}