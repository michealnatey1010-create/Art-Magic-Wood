import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const vendorId = formData.get("vendorId") as string | null;
    const storeName = formData.get("storeName") as string | null;
    const storeAddress = formData.get("storeAddress") as string | null;
    const phone = formData.get("phone") as string | null;

    if (!file || !vendorId) {
      return NextResponse.json({ success: false, message: "الملف و vendorId مطلوبان" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

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

    if (products.length === 0) {
      return NextResponse.json({ success: false, message: "لم يتم العثور على منتجات صالحة في الملف" }, { status: 400 });
    }

    let count = 0;
    await prisma.$transaction(
      products.map((p) => {
        const sku = p.sku?.trim() || null;
        if (sku) {
          return prisma.merchantProduct.upsert({
            where: { sku },
            update: { name: p.name, price: p.price, stock: p.stock, description: p.description || "", image: p.image || "" },
            create: { name: p.name, price: p.price, stock: p.stock, description: p.description || "", image: p.image || "", sku, vendor_id: vendorId },
          });
        }
        return prisma.merchantProduct.create({
          data: { name: p.name, price: p.price, stock: p.stock, description: p.description || "", image: p.image || "", vendor_id: vendorId },
        });
      })
    );
    count = products.length;

    return NextResponse.json({ success: true, message: `تمت إضافة ${count} منتج بنجاح`, count });
  } catch (e) {
    console.error("Upload inventory error:", e);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء رفع المخزون" }, { status: 500 });
  }
}