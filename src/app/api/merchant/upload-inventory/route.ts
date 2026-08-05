import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

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

    // جلب الملف من Cloudinary
    console.log("📦 Fetching file from:", fileUrl);
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      console.error("📦 Failed to fetch file, status:", fileRes.status);
      return NextResponse.json(
        { success: false, message: "تعذر تحميل الملف من الرابط" },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await fileRes.arrayBuffer());
    console.log("📦 File fetched, buffer size:", buffer.length);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);
    console.log("📦 Excel rows parsed:", rows.length);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "الملف فارغ" }, { status: 400 });
    }

    const products = rows.map((row: any) => ({
      name: String(row.name || row.NAME || row.Name || row["اسم المنتج"] || ""),
      price: parseFloat(row.price || row.PRICE || row.Price || row["السعر"] || 0),
      stock: parseInt(row.stock || row.STOCK || row.Stock || row["المخزون"] || 0),
      description: String(row.description || row.DESCRIPTION || row.Description || row["الوصف"] || ""),
      image: String(row.image || row.IMAGE || row.Image || row["الصورة"] || ""),
      sku: String(row.sku || row.SKU || row.Sku || row["الكود"] || ""),
    })).filter((p) => p.name);
    console.log("📦 Valid products:", products.length);

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, message: "لم يتم العثور على منتجات صالحة في الملف" },
        { status: 400 }
      );
    }

    // التحقق من وجود التاجر (تجنب أخطاء Foreign Key)
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

    console.log("📦 Inserting products...");
    await prisma.$transaction(
      products.map((p) => {
        const sku = p.sku?.trim() || null;
        if (sku) {
          return prisma.merchantProduct.upsert({
            where: { sku },
            update: { name: p.name, price: p.price, stock: p.stock, description: p.description || "", image: p.image || "" },
            create: { name: p.name, price: p.price, stock: p.stock, description: p.description || "", image: p.image || "", sku, vendor_id: merchantId },
          });
        }
        return prisma.merchantProduct.create({
          data: { name: p.name, price: p.price, stock: p.stock, description: p.description || "", image: p.image || "", vendor_id: merchantId },
        });
      })
    );
    console.log("📦 Products inserted:", products.length);

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