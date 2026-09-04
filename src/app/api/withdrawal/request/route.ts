import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount, phoneNumber, bankName, accountNumber } = await req.json();

    if (!amount || !phoneNumber) {
      return NextResponse.json({ error: "المبلغ ورقم الهاتف مطلوبان" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

    const minAmount = user.minWithdrawal ?? 100;

    if (amount < minAmount) {
      return NextResponse.json({ error: `الحد الأدنى للتحويل هو ${minAmount} نقطة` }, { status: 400 });
    }

    if (user.points < amount) {
      return NextResponse.json({ error: "رصيد نقاط غير كافٍ" }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        userId: session.id,
        amount,
        pointsUsed: amount,
        phoneNumber,
        bankName: bankName || null,
        accountNumber: accountNumber || null,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إرسال طلب التحويل بنجاح، في انتظار موافقة المسؤول",
      data: withdrawal,
    }, { status: 201 });
  } catch (e) {
    console.error("Withdrawal request error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
