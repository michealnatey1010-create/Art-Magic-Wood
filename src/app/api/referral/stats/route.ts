import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.id },
      include: { referred: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    const totalPoints = referrals.reduce((sum, r) => sum + r.pointsEarnedByReferrer, 0);
    const totalDiscount = referrals.reduce((sum, r) => sum + r.discountAmount, 0);

    return NextResponse.json({
      referralCode: user.referralCode,
      referralActive: user.referralActive,
      totalReferrals: referrals.length,
      totalPoints,
      totalDiscount,
      discountAmount: user.referralDiscount ?? 50,
      pointsPerUse: user.referralPointsPerUse ?? 30,
      minWithdrawal: user.minWithdrawal ?? 100,
      referrals: referrals.map((r) => ({
        id: r.id,
        referredName: r.referred.name,
        discountAmount: r.discountAmount,
        pointsEarned: r.pointsEarnedByReferrer,
        createdAt: r.createdAt,
      })),
    });
  } catch (e) {
    console.error("Referral stats error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
