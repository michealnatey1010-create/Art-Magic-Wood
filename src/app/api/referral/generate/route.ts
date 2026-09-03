import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function generateCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "").toUpperCase();
  const latin = clean.replace(/[\u0600-\u06FF]/g, "");
  const base = latin.length >= 3 ? latin.slice(0, 3) : latin || "REF";
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${base}${rand}`;
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

    if (user.referralCode) {
      return NextResponse.json({ referralCode: user.referralCode, referralActive: user.referralActive });
    }

    let code = generateCode(user.name);
    let exists = await prisma.user.findUnique({ where: { referralCode: code } });
    let attempts = 0;
    while (exists && attempts < 10) {
      code = generateCode(user.name);
      exists = await prisma.user.findUnique({ where: { referralCode: code } });
      attempts++;
    }
    if (exists) {
      return NextResponse.json({ error: "تعذر إنشاء كود فريد، حاول مرة أخرى" }, { status: 500 });
    }

    await prisma.user.update({
      where: { id: session.id },
      data: { referralCode: code },
    });

    return NextResponse.json({ referralCode: code, referralActive: false });
  } catch (e) {
    console.error("Generate referral code error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
