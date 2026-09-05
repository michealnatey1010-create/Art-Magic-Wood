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
  let pointsForReferrer = 0;
  if (referralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true, referralActive: true, referralDiscount: true, referralPointsPerUse: true },
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
    updateOps.push(
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