import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { stageId, productId, orderType, userName, address, phone, senderPhone, receiptImage, items, totalAmount } = await req.json();

    if (!userName || !phone) {
      return NextResponse.json({ success: false, message: "الاسم ورقم الهاتف مطلوبان" }, { status: 400 });
    }

    const itemsStr = items ? JSON.stringify(items) : JSON.stringify(orderType === "stage" && productId ? [{ id: productId }] : []);

    const order = await prisma.order.create({
      data: {
        customer_name: userName,
        customer_phone: phone,
        customer_address: address || "",
        payment_phone: senderPhone || "",
        payment_receipt: receiptImage || "",
        items: itemsStr,
        total_amount: totalAmount || 0,
        source: orderType || "",
        notes: "",
      },
    });

    return NextResponse.json({ success: true, message: "تم إرسال الطلب بنجاح", orderId: order.id }, { status: 201 });
  } catch (e) {
    console.error("Order error:", e);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تقديم الطلب" }, { status: 500 });
  }
}