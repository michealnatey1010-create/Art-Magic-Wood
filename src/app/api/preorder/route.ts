import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.preorderProduct.findMany({
      orderBy: { created_at: "desc" },
      select: { id: true, name: true, price: true, image: true, description: true },
    });
    const data = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      description: p.description,
    }));
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "خطأ في جلب البيانات" }, { status: 500 });
  }
}