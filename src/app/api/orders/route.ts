import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const { itemId, source, price, itemName } = data;
  const usePoints = data.usePoints || 0; // عدد النقاط التي يريد استخدامها

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

  // التحقق من أن المستخدم لديه نقاط كافية
  if (usePoints > user.points) {
    return NextResponse.json({ error: "رصيد نقاط غير كافٍ" }, { status: 400 });
  }

  // حساب الخصم (كل نقطة = 1 جنيه)
  const discount = usePoints;
  const finalPrice = Math.max(0, price - discount);

  // حساب النقاط المكتسبة (مثلاً: 1 نقطة لكل 10 جنيهات)
  const pointsEarned = Math.floor(price / 10);

  // إنشاء الطلب
  const order = await prisma.order.create({
    data: {
      userId: session.id,
      itemId,
      source,
      itemName,
      price,
      discount,
      pointsUsed: usePoints,
      pointsEarned,
      status: "pending",
    },
  });

  // تحديث رصيد النقاط: خصم النقاط المستخدمة + إضافة النقاط المكتسبة
  await prisma.user.update({
    where: { id: session.id },
    data: {
      points: user.points - usePoints + pointsEarned,
    },
  });

  return NextResponse.json({
    success: true,
    message: "تم إنشاء الطلب بنجاح",
    orderId: order.id,
    finalPrice,
    pointsUsed: usePoints,
    pointsEarned,
    newBalance: user.points - usePoints + pointsEarned,
  });
}