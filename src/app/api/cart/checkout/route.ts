import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    console.log("🛒 Received checkout data:", body);
    const { usePoints, receiptImage, address, phone, senderPhone, userName, referralCode } = body;
    const pointsValue = parseInt(usePoints) || 0;

    console.log("📦 Received cart checkout data:");
    console.log("userName:", userName);
    console.log("address:", address);
    console.log("phone:", phone);
    console.log("senderPhone:", senderPhone);

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

    let referralDiscount = 0;
    let referrerId = null;
    let pointsForReferrer = 0;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
        select: {
          id: true,
          referralActive: true,
          referralDiscount: true,
          referralPointsPerUse: true,
        },
      });
      if (referrer && referrer.referralActive && referrer.id !== session.id) {
        const alreadyUsed = await prisma.referral.findFirst({
          where: { referredId: session.id, referrerId: referrer.id, status: { in: ["pending", "confirmed"] } },
        });
        if (!alreadyUsed) {
          referralDiscount = referrer.referralDiscount ?? 50;
          pointsForReferrer = referrer.referralPointsPerUse ?? 30;
          referrerId = referrer.id;
        }
      }
    }

    const totalAfterPoints = total - pointsToUse;
    const finalPrice = Math.max(0, totalAfterPoints - referralDiscount);
    const pointsEarned = Math.floor(total / 10);
    const newBalance = user.points - pointsToUse + pointsEarned;

    const orderData: any = {
      userId: session.id,
      source: "cart",
      itemId: cart.id,
      itemName: `سلة تسوق (${cart.items.length} منتجات)`,
      price: total,
      discount: pointsToUse + referralDiscount,
      pointsUsed: pointsToUse,
      pointsEarned,
      receiptImage: receiptImage || null,
      address: address || null,
      phone: phone || null,
      senderPhone: senderPhone || null,
      status: "pending",
      items: {
        create: cart.items.map((i) => ({
          productName: i.productName,
          price: i.price,
          quantity: i.quantity,
        })),
      },
    };

    const order = await prisma.order.create({ data: orderData });

    const prismaOps: any[] = [
      prisma.cartItem.deleteMany({ where: { cart_id: cart.id } }),
      prisma.user.update({
        where: { id: session.id },
        data: { points: newBalance },
      }),
    ];

    if (referrerId && referralDiscount > 0) {
      const newReferral = await prisma.referral.create({
        data: {
          referrerId,
          referredId: session.id,
          discountAmount: referralDiscount,
          pointsEarnedByReferrer: pointsForReferrer,
          orderId: order.id,
          status: "pending",
        },
      });
      prismaOps.push(
        prisma.order.update({
          where: { id: order.id },
          data: { referralId: newReferral.id },
        }),
        prisma.user.update({
          where: { id: session.id },
          data: { referredBy: referrerId },
        })
      );
    }

    await prisma.$transaction(prismaOps);

    return NextResponse.json({
      success: true,
      message: "تم إتمام الطلب بنجاح",
      data: {
        orderTotal: total,
        discount: pointsToUse + referralDiscount,
        finalPrice,
        pointsUsed: pointsToUse,
        referralDiscount,
        pointsEarned,
        newBalance,
      },
    }, { status: 201 });
  } catch (e) {
    console.error("Cart checkout error:", e);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء إتمام الطلب" }, { status: 500 });
  }
}