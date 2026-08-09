import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import prisma from "@/lib/prisma";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (file: File, folder: string, resourceType: "auto" | "raw" | "image") =>
  new Promise<string>((resolve, reject) => {
    file.arrayBuffer()
      .then((buffer) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder, resource_type: resourceType, access_mode: "public" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result?.secure_url || "");
          }
        );
        stream.end(Buffer.from(buffer));
      })
      .catch(reject);
  });

export async function POST(req: Request) {
  try {
    console.log("📦 Received upload request");
    const contentType = req.headers.get("content-type") || "";

    let merchantId = "";
    let storeName = "";
    let storeAddress = "";
    let phone = "";
    let fileUrl = "";
    let fileName = "";

    if (contentType.includes("multipart/form-data")) {
      // رفع ملف مباشر من التطبيق (FormData) → نرفعه للسيرفر بـ resource_type auto
      const form = await req.formData();
      merchantId = (form.get("merchantId") as string) || "";
      storeName = (form.get("storeName") as string) || "";
      storeAddress = (form.get("storeAddress") as string) || "";
      phone = (form.get("phone") as string) || "";
      fileName = (form.get("fileName") as string) || "";
      const file = form.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, message: "الملف مطلوب (file)" },
          { status: 400 }
        );
      }

      console.log("📦 Uploading file to Cloudinary (resource_type auto)...");
      fileUrl = await uploadToCloudinary(file, "merchant-inventory", "auto");
      console.log("📦 Uploaded:", fileUrl);
    } else {
      // التوافق القديم: fileUrl جاهز من التطبيق
      const body = await req.json();
      console.log("📦 Body:", body);
      merchantId = body.merchantId || "";
      storeName = body.storeName || "";
      storeAddress = body.storeAddress || "";
      phone = body.phone || "";
      fileUrl = body.fileUrl || "";
      fileName = body.fileName || "";
    }

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

    // حفظ سجل رفع المخزون
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
      fileUrl,
    });
  } catch (e) {
    console.error("❌ Upload inventory error:", e);
    return NextResponse.json({
      success: false,
      message: "خطأ في الخادم: " + (e as Error).message,
    }, { status: 500 });
  }
}