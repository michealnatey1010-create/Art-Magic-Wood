import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { packageId, subscriptionType, userName, address, phone, senderPhone, receiptImage } = await req.json();
    console.log("Saving subscription:", { packageId, subscriptionType, userName, address, phone, senderPhone, receiptImage });

    if (!packageId || !subscriptionType || !userName || !phone) {
      return NextResponse.json({ success: false, message: "الحقول المطلوبة: packageId, subscriptionType, userName, phone" }, { status: 400 });
    }

    const pkg = await prisma.teacherPackage.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return NextResponse.json({ success: false, message: "الباقة غير موجودة" }, { status: 404 });
    }

    const price = subscriptionType === "quarterly" ? pkg.quarterly_price : pkg.monthly_price;
    const pointsEarned = Math.floor(price / 10);

    const result = await prisma.$transaction([
      prisma.subscription.create({
        data: {
          package_id: packageId,
          package_name: pkg.name,
          subscription_type: subscriptionType,
          user_name: userName,
          address: address || "",
          phone,
          sender_phone: senderPhone || "",
          receipt_image: receiptImage || "",
        },
      }),
      prisma.order.create({
        data: {
          userId: session.id,
          source: "teacher_box",
          itemId: packageId,
          itemName: pkg.name,
          price,
          discount: 0,
          pointsUsed: 0,
          pointsEarned,
          receiptImage: receiptImage || null,
          status: "pending",
          items: {
            create: [{ productName: pkg.name, price, quantity: 1 }],
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "تم الاشتراك بنجاح",
      subscriptionId: result[0].id,
      orderId: result[1].id,
      price,
      pointsEarned,
    }, { status: 201 });
  } catch (e) {
    console.error("Subscription error:", e);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء الاشتراك" }, { status: 500 });
  }
}