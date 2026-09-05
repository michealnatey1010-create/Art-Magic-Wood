import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function withCors(res: NextResponse): NextResponse {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return withCors(
      NextResponse.json(
        { success: false, message: "غير مصرح، يرجى تسجيل الدخول" },
        { status: 401 }
      )
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const code = (body?.code ?? body?.referralCode ?? "").toString().trim().toUpperCase();
    if (!code) {
      return withCors(
        NextResponse.json(
          { success: false, message: "رابط التحقق من كود الإحالة غير صالح" },
          { status: 422 }
        )
      );
    }

    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: {
        id: true,
        role: true,
        referralActive: true,
        referralDiscount: true,
      },
    });

    if (!referrer || !referrer.referralActive || referrer.role !== "TEACHER") {
      return withCors(
        NextResponse.json(
          { success: false, message: "كود الإحالة غير صحيح أو انتهت صلاحيته" },
          { status: 404 }
        )
      );
    }

    if (referrer.id === session.id) {
      return withCors(
        NextResponse.json(
          { success: false, message: "لا يمكنك استخدام كود إحالتك الخاص" },
          { status: 422 }
        )
      );
    }

    const existingReferral = await prisma.referral.findFirst({
      where: { referredId: session.id, referrerId: referrer.id, status: { in: ["pending", "confirmed"] } },
      select: { id: true },
    });
    if (existingReferral) {
      return withCors(
        NextResponse.json(
          { success: false, message: "لقد استخدمت كود إحالة هذا المعلم من قبل" },
          { status: 422 }
        )
      );
    }

    const discountAmount = referrer.referralDiscount ?? 50;

    return withCors(
      NextResponse.json({
        success: true,
        message: `تهانينا! حصلت على خصم بقيمة ${discountAmount} ج.م`,
        discountAmount: Number(discountAmount),
      })
    );
  } catch (e) {
    console.error("Verify referral code error:", e);
    return withCors(
      NextResponse.json(
        { success: false, message: "حدث خطأ أثناء التحقق من الكود" },
        { status: 500 }
      )
    );
  }
}