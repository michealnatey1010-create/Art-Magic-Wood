import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.teacherPackage.findMany({
      orderBy: { created_at: "desc" },
      include: { features: { select: { text: true } } },
    });
    const data = packages.map((p) => ({
      id: p.id,
      name: p.name,
      priceMonthly: p.monthly_price,
      priceSemester: p.quarterly_price,
      features: p.features.map((f) => f.text),
      image: "",
    }));
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "خطأ في جلب البيانات" }, { status: 500 });
  }
}