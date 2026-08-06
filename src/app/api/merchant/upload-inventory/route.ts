import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("📦 Received upload request");
    const body = await req.json();
    console.log("📦 Body:", body);

    const {
      merchantId,
      storeName,
      storeAddress,
      phone,
      fileUrl,
      fileName,
    } = body;

    if (!fileUrl || !merchantId) {
      return NextResponse.json(
        { success: false, message: "fileUrl و merchantId مطلوبان" },
        { status: 400 }
      );
    }

    // التحقق من وجود التاجر (لتجنب أخطاء Foreign Key)
    const merchant = await prisma.user.findUnique({ where: { id: merchantId } });
    console.log("📦 Merchant found:", !!merchant);
    if (!merchant) {
      return NextResponse.json(
        { success: false, message: "التاجر غير موجود (merchantId غير صالح)" },
        { status: 400 }
      );
    }

    // تحديث بيانات المتجر (User)
    await prisma.user.update({
      where: { id: merchantId },
      data: {
        ...(storeName ? { school: storeName } : {}),
        ...(storeAddress ? { storeLocation: storeAddress } : {}),
        ...(phone ? { phone } : {}),
      },
    });
    console.log("📦 Merchant store details updated");

    // حفظ سجل رفع المخزون (بدون أي معالجة للملف)
    await prisma.merchantInventory.create({
      data: {
        merchant_id: merchantId,
        store_name: storeName || "",
        store_address: storeAddress || "",
        phone: phone || "",
        file_url: fileUrl,
        file_name: fileName || "",
      },
    });
    console.log("📦 MerchantInventory saved");

    return NextResponse.json({
      success: true,
      message: "تم رفع ملف المخزون بنجاح",
    });
  } catch (e) {
    console.error("❌ Upload inventory error:", e);
    return NextResponse.json({
      success: false,
      message: "خطأ في الخادم: " + (e as Error).message,
    }, { status: 500 });
  }
}