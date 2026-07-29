import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const stages = await prisma.stage.findMany({
      orderBy: { created_at: "desc" },
      include: {
        products: { orderBy: { created_at: "asc" }, select: { id: true, name: true, price: true, image: true } },
      },
    });

    const data = stages.map((s) => ({
      id: s.id,
      name: s.name,
      coverImage: s.coverImage,
      points: s.points,
      price: s.price,
      products: s.products.map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.image })),
    }));

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "خطأ في جلب البيانات" }, { status: 500 });
  }
}