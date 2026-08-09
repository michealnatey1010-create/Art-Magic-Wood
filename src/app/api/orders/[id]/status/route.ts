import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();
  console.log("Updating order:", id, "to status:", status);

  const validStatuses = ["confirmed", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // جلب الطلب من قاعدة البيانات
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const isAdmin = (session.role || "").toUpperCase() === "ADMIN";

  // التحقق من صلاحية المستخدم (يسمح للمشرف أو مالك الطلب)
  if (!isAdmin && order.userId !== session.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // المستخدم العادي يسمح له فقط بإلغاء طلبه
  if (!isAdmin && status !== "cancelled") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // التحقق من أن الحالة الحالية تسمح بالإلغاء
  if (status === "cancelled" && order.status !== "pending" && order.status !== "confirmed") {
    return NextResponse.json(
      { error: "لا يمكن إلغاء طلب تم شحنه أو توصيله" },
      { status: 400 }
    );
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        confirmedAt: status === "confirmed" ? new Date() : undefined,
        shippedAt: status === "shipped" ? new Date() : undefined,
        deliveredAt: status === "delivered" ? new Date() : undefined,
      },
    });

    // إرسال إشعار FCM إلى جهاز المستخدم (سنضبط المفاتيح لاحقاً)
    // await sendFcmNotification(order.userId, `تم ${status} طلبك`);

    return NextResponse.json({ success: true, message: "تم تحديث حالة الطلب", order: updatedOrder });
  } catch (e) {
    console.error("Update order status error:", e);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}