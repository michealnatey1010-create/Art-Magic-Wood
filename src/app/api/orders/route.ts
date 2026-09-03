import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: orders });
}

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  console.log("📦 Received order data:", data);
  const { itemId, source, price, itemName, receiptImage, address, phone, senderPhone, referralCode } = data;
  const usePoints = data.usePoints || 0; // عدد النقاط التي يريد استخدامها

  console.log("📦 Received order data:");
  console.log("address:", address);
  console.log("phone:", phone);
  console.log("senderPhone:", senderPhone);

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

  // التحقق من أن المستخدم لديه نقاط كافية
  if (usePoints > user.points) {
    return NextResponse.json({ error: "رصيد نقاط غير كافٍ" }, { status: 400 });
  }

  // حساب الخصم (كل نقطة = 1 جنيه)
  const discount = usePoints;

  let referralDiscount = 0;
  let referrerId = null;
  if (referralCode) {
    const referrer = await prisma.user.findFirst({
      where: { referralCode, referralActive: true },
    });
    if (referrer && referrer.id !== session.id) {
      const alreadyUsed = await prisma.referral.findFirst({
        where: { referredId: session.id, referrerId: referrer.id },
      });
      if (!alreadyUsed) {
        const settings = await prisma.appSettings.findFirst();
        referralDiscount = settings?.referralDiscount ?? 50;
        referrerId = referrer.id;
      }
    }
  }

  const totalDiscount = discount + referralDiscount;
  const finalPrice = Math.max(0, price - totalDiscount);

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
      discount: totalDiscount,
      pointsUsed: usePoints,
      pointsEarned,
      receiptImage: receiptImage || null,
      address: address || null,
      phone: phone || null,
      senderPhone: senderPhone || null,
      status: "pending",
      items: {
        create: [{ productName: itemName, price, quantity: 1 }],
      },
    },
  });

  // تحديث رصيد النقاط: خصم النقاط المستخدمة + إضافة النقاط المكتسبة
  const updateOps: any[] = [
    prisma.user.update({
      where: { id: session.id },
      data: { points: user.points - usePoints + pointsEarned },
    }),
  ];

  if (referrerId && referralDiscount > 0) {
    const settings = await prisma.appSettings.findFirst();
    const pointsForReferrer = settings?.referralPointsPerUse ?? 30;
    updateOps.push(
      prisma.referral.create({
        data: {
          referrerId,
          referredId: session.id,
          discountAmount: referralDiscount,
          pointsEarnedByReferrer: pointsForReferrer,
          orderId: order.id,
        },
      }),
      prisma.user.update({
        where: { id: referrerId },
        data: { points: { increment: pointsForReferrer } },
      }),
      prisma.user.update({
        where: { id: session.id },
        data: { referredBy: referrerId },
      })
    );
  }

  await prisma.$transaction(updateOps);

  return NextResponse.json({
    success: true,
    message: "تم إنشاء الطلب بنجاح",
    orderId: order.id,
    finalPrice,
    pointsUsed: usePoints,
    referralDiscount,
    pointsEarned,
    newBalance: user.points - usePoints + pointsEarned,
  });
}