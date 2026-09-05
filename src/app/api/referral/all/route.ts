import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const isAdmin = (session.role || "").toUpperCase() === "ADMIN";
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const referrerId = req.nextUrl.searchParams.get("referrerId");

  const referrals = await prisma.referral.findMany({
    where: referrerId ? { referrerId } : undefined,
    include: {
      referrer: { select: { name: true } },
      referred: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: referrals.map((r) => ({
      id: r.id,
      referrerId: r.referrerId,
      referrerName: r.referrer.name,
      referredName: r.referred.name,
      referredEmail: r.referred.email,
      referredPhone: r.referred.phone,
      discountAmount: r.discountAmount,
      pointsEarnedByReferrer: r.pointsEarnedByReferrer,
      status: r.status,
      orderId: r.orderId,
      createdAt: r.createdAt,
    })),
  });
}