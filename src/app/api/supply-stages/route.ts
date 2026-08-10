import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import prisma from "@/lib/prisma";

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

export async function GET() {
  try {
    const stages = await prisma.stage.findMany({
      orderBy: { created_at: "desc" },
      include: {
        products: { orderBy: { created_at: "asc" }, select: { id: true, name: true, price: true, image: true } },
      },
    });

    const data = stages.map((s) => ({
      id: s.id,
      name: s.name,
      coverImage: s.coverImage,
      points: s.points,
      price: s.price,
      products: s.products.map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.image })),
    }));

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "خطأ في جلب البيانات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = String(formData.get("name") || "");
    const points = parseInt(String(formData.get("points") || "0")) || 0;
    const price = parseFloat(String(formData.get("price") || "0")) || 0;

    if (!name) {
      return NextResponse.json({ success: false, message: "اسم المرحلة مطلوب" }, { status: 400 });
    }

    let coverImage = "";
    const rawCover = formData.get("coverImage") || formData.get("file");
    if (typeof rawCover === "string" && rawCover.startsWith("http")) {
      coverImage = rawCover;
    } else if (rawCover && typeof rawCover === "object" && "size" in rawCover) {
      coverImage = await uploadToCloudinary(rawCover as File);
    }

    // Products come as a JSON string (same handling as PUT)
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

    const stage = await prisma.stage.create({
      data: {
        name,
        points,
        price,
        coverImage,
        products: products.length > 0 ? { create: products } : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء المرحلة بنجاح",
      stage: { id: stage.id, name: stage.name, coverImage: stage.coverImage },
    }, { status: 201 });
  } catch (e) {
    console.error("Create stage error:", e);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء إنشاء المرحلة" }, { status: 500 });
  }
}