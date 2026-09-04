import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { referralCode, orderId } = await req.json();
    if (!referralCode || !orderId) {
      return NextResponse.json({ error: "كود الإحالة ورقم الطلب مطلوبان" }, { status: 400 });
    }

    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: {
        id: true,
        name: true,
        points: true,
        referralDiscount: true,
        referralPointsPerUse: true,
        referralActive: true,
      },
    });
    if (!referrer || !referrer.referralActive) {
      return NextResponse.json({ error: "كود الإحالة غير صالح أو غير مفعّل" }, { status: 400 });
    }
    if (referrer.id === session.id) {
      return NextResponse.json({ error: "لا يمكنك استخدام كود إحالتك الخاص" }, { status: 400 });
    }

    const existingReferral = await prisma.referral.findFirst({
      where: { referredId: session.id, referrerId: referrer.id },
    });
    if (existingReferral) {
      return NextResponse.json({ error: "لقد استخدمت كود إحالة هذا المعلم من قبل" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (order.userId !== session.id) {
      return NextResponse.json({ error: "هذا الطلب لا يخصك" }, { status: 403 });
    }

    const discountAmount = referrer.referralDiscount ?? 50;
    const pointsForReferrer = referrer.referralPointsPerUse ?? 30;

    await prisma.$transaction([
      prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: session.id,
          discountAmount,
          pointsEarnedByReferrer: pointsForReferrer,
          orderId,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { discount: order.discount + discountAmount },
      }),
      prisma.user.update({
        where: { id: referrer.id },
        data: { points: referrer.points + pointsForReferrer },
      }),
      prisma.user.update({
        where: { id: session.id },
        data: { referredBy: referrer.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "تم تطبيق كود الإحالة بنجاح",
      discount: discountAmount,
      referrerName: referrer.name,
    });
  } catch (e) {
    console.error("Use referral code error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
