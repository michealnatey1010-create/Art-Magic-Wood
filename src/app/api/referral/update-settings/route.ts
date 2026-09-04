import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  const session = await getSession(req);
  if (!session || (session.role || "").toUpperCase() !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, discount, pointsPerUse, minWithdrawal } = await req.json();

  if (!userId || discount === undefined || pointsPerUse === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      referralDiscount: discount,
      referralPointsPerUse: pointsPerUse,
      ...(minWithdrawal !== undefined ? { minWithdrawal } : {}),
    },
  });

  return NextResponse.json({ success: true, user });
}
