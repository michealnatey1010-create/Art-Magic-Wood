import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const libraries = await prisma.library.findMany({
      orderBy: { created_at: "desc" },
      select: { id: true, name: true, email: true, commission: true, active: true },
    });

    const data = libraries.map((lib) => ({
      id: lib.id,
      name: lib.name,
      phone: lib.email,
      address: "",
      commissionRate: lib.commission,
    }));

    if (data.length === 0) {
      return NextResponse.json({
        success: true,
        data: [
          { id: "1", name: "مكتبة النور", phone: "01000000000", address: "القاهرة", commissionRate: 10 },
          { id: "2", name: "مكتبة الأمل", phone: "01111111111", address: "الإسكندرية", commissionRate: 15 },
        ],
      });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "خطأ في جلب البيانات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, phone, address, commissionRate } = await req.json();

    if (!name) {
      return NextResponse.json({ success: false, message: "اسم المكتبة مطلوب" }, { status: 400 });
    }

    await prisma.library.create({
      data: {
        name,
        email: phone || "",
        commission: commissionRate || 10,
      },
    });

    return NextResponse.json({ success: true, message: "تمت إضافة المكتبة بنجاح" }, { status: 201 });
  } catch (e) {
    console.error("Library error:", e);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء إضافة المكتبة" }, { status: 500 });
  }
}