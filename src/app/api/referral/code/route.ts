import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.id) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح به' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        referralCode: true,
        referralActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    if (!user.referralCode) {
      const newCode = generateReferralCode();

      const updatedUser = await prisma.user.update({
        where: { id: session.id },
        data: { referralCode: newCode },
      });

      return NextResponse.json({
        success: true,
        data: {
          code: updatedUser.referralCode,
          isActive: updatedUser.referralActive || false,
        },
        message: 'تم توليد كود إحالة جديد',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        code: user.referralCode,
        isActive: user.referralActive || false,
      },
      message: 'تم جلب كود الإحالة بنجاح',
    });
  } catch (error) {
    console.error('Error fetching referral code:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب كود الإحالة' },
      { status: 500 }
    );
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
