import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createMerchantProducts } from "@/lib/db/mutations";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const vendorId = formData.get("vendorId") as string | null;

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

    const count = createMerchantProducts(vendorId, products);

    return NextResponse.json({ success: true, message: `تمت إضافة ${count} منتج بنجاح`, count });
  } catch (e) {
    console.error("❌ Upload inventory error:", e);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء رفع المخزون" }, { status: 500 });
  }
}
