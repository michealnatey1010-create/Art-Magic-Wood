import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { packageId, subscriptionType, userName, address, phone, senderPhone, receiptImage } = await req.json();

    if (!packageId || !subscriptionType || !userName || !phone) {
      return NextResponse.json({ success: false, message: "الحقول المطلوبة: packageId, subscriptionType, userName, phone" }, { status: 400 });
    }

    const pkg = await prisma.teacherPackage.findUnique({ where: { id: packageId } });

    const subscription = await prisma.subscription.create({
      data: {
        package_id: packageId,
        package_name: pkg?.name || "",
        subscription_type: subscriptionType,
        user_name: userName,
        address: address || "",
        phone,
        sender_phone: senderPhone || "",
        receipt_image: receiptImage || "",
      },
    });

    return NextResponse.json({ success: true, message: "تم الاشتراك بنجاح", subscriptionId: subscription.id }, { status: 201 });
  } catch (e) {
    console.error("Subscription error:", e);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء الاشتراك" }, { status: 500 });
  }
}