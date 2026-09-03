import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function getOrCreateSettings() {
  let settings = await prisma.appSettings.findFirst();
  if (!settings) {
    settings = await prisma.appSettings.create({ data: {} });
  }
  return settings;
}

export async function GET() {
  try {
    const settings = await getOrCreateSettings();
    return NextResponse.json(settings);
  } catch (e) {
    console.error("Get settings error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const settings = await getOrCreateSettings();

    const updated = await prisma.appSettings.update({
      where: { id: settings.id },
      data: {
        referralDiscount: body.referralDiscount ?? settings.referralDiscount,
        referralPointsPerUse: body.referralPointsPerUse ?? settings.referralPointsPerUse,
        minWithdrawalAmount: body.minWithdrawalAmount ?? settings.minWithdrawalAmount,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update settings error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
