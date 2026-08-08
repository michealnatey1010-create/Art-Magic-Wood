import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const mapped = orders.map((o) => ({
    id: o.id,
    status: o.status,
    totalPrice: o.price,
    createdAt: o.createdAt.toISOString(),
    items:
      o.items.length > 0
        ? o.items.map((i) => ({
            productName: i.productName,
            price: i.price,
            quantity: i.quantity,
          }))
        : [{ productName: o.itemName, price: o.price, quantity: 1 }],
  }));

  return NextResponse.json({ success: true, orders: mapped });
}