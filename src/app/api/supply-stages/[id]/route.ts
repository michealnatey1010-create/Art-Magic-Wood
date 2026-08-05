import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";
import prisma from "@/lib/prisma";
import { updateStage } from "@/lib/db/mutations";
import { getSession } from "@/lib/auth";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (file: File) =>
  new Promise<string>((resolve, reject) => {
    file.arrayBuffer()
      .then((buffer) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: "stages" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result?.secure_url || "");
          }
        );
        stream.end(Buffer.from(buffer));
      })
      .catch(reject);
  });

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const existing = await prisma.stage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "المرحلة غير موجودة" }, { status: 404 });
    }

    const formData = await req.formData();
    const name = String(formData.get("name") || "");
    if (!name) {
      return NextResponse.json({ success: false, message: "اسم المرحلة مطلوب" }, { status: 400 });
    }
    const points = parseInt(String(formData.get("points") || "0")) || 0;
    const price = parseFloat(String(formData.get("price") || "0")) || 0;

    // Cover image: URL string from client-side direct upload, or file (fallback)
    let coverImage = existing.coverImage;
    const rawCover = formData.get("coverImage") || formData.get("file");
    if (typeof rawCover === "string" && rawCover.startsWith("http")) {
      coverImage = rawCover;
    } else if (rawCover && typeof rawCover === "object" && "size" in rawCover) {
      coverImage = await uploadToCloudinary(rawCover as File);
    }

    // Products come as a JSON string
    let products: { name: string; price?: number; image?: string }[] = [];
    try {
      const rawProducts = formData.get("products");
      if (rawProducts) {
        const parsed = JSON.parse(String(rawProducts));
        if (Array.isArray(parsed)) {
          products = parsed
            .filter((p: any) => p && typeof p.name === "string" && p.name.trim())
            .map((p: any) => ({
              name: p.name.trim(),
              price: p.price ? parseFloat(p.price) : undefined,
              image: p.image || "",
            }));
        }
      }
    } catch {
      products = [];
    }

    await updateStage(id, { name, points, price, coverImage, products });

    return NextResponse.json({
      success: true,
      message: "تم تحديث المرحلة بنجاح",
      stage: { id, name, coverImage, points, price },
    });
  } catch (e) {
    console.error("Update stage error:", e);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء تحديث المرحلة" }, { status: 500 });
  }
}