import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // owner أو admin فقط يمكنه رؤية الطلب
  if (order.userId !== session.id && (session.role || "").toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    order: {
      id: order.id,
      source: order.source,
      status: order.status,
      totalPrice: order.price,
      discount: order.discount,
      pointsUsed: order.pointsUsed,
      pointsEarned: order.pointsEarned,
      receiptImage: order.receiptImage,
      address: order.address,
      phone: order.phone,
      senderPhone: order.senderPhone,
      createdAt: order.createdAt,
      confirmedAt: order.confirmedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      items:
        order.items.length > 0
          ? order.items.map((i) => ({
              productName: i.productName,
              price: i.price,
              quantity: i.quantity,
            }))
          : [{ productName: order.itemName, price: order.price, quantity: 1 }],
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { status } = await req.json();
  const validStatuses = ["confirmed", "shipped", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        confirmedAt: status === "confirmed" ? new Date() : undefined,
        shippedAt: status === "shipped" ? new Date() : undefined,
        deliveredAt: status === "delivered" ? new Date() : undefined,
      },
    });

    // هنا سنضيف إرسال الإشعار (FCM) لاحقاً
    // await sendNotification(order.userId, `تم ${status} طلبك`);

    return NextResponse.json({ success: true, order });
  } catch (e) {
    console.error("Update order status error:", e);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}