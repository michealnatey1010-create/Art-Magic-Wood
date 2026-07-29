import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, source, itemId, itemName, price, discount, pointsUsed } = await req.json();

    if (!userId || !source || !itemId || !itemName) {
      return NextResponse.json({ success: false, message: "userId, source, itemId, itemName مطلوبون" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
    }

    const pointsUsedVal = Math.min(pointsUsed || 0, user.points);
    const discountVal = discount || (pointsUsedVal > 0 ? pointsUsedVal * 0.1 : 0);
    const pointsEarned = Math.floor((price - discountVal) / 10);

    const order = await prisma.order.create({
      data: {
        userId,
        source,
        itemId,
        itemName,
        price,
        discount: discountVal,
        pointsUsed: pointsUsedVal,
        pointsEarned,
      },
    });

    if (pointsUsedVal > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { points: { decrement: pointsUsedVal } },
      });
    }
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: pointsEarned } },
    });

    return NextResponse.json({ success: true, message: "تم تقديم الطلب بنجاح", orderId: order.id }, { status: 201 });
  } catch (e) {
    console.error("Order error:", e);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تقديم الطلب" }, { status: 500 });
  }
}