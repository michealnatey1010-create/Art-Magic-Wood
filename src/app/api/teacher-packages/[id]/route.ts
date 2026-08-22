import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updateTeacherPackage } from "@/lib/db/mutations";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const existing = await prisma.teacherPackage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "الباقة غير موجودة" }, { status: 404 });
    }

    const body = await req.json();
    const name = body.name?.trim();
    if (!name) return NextResponse.json({ error: "اسم الباقة مطلوب" }, { status: 400 });

    await updateTeacherPackage(id, {
      name,
      monthlyPrice: parseFloat(body.monthlyPrice) || 0,
      quarterlyPrice: parseFloat(body.quarterlyPrice) || 0,
      image: typeof body.image === "string" ? body.image : undefined,
      features: Array.isArray(body.features)
        ? body.features.filter((f: unknown) => typeof f === "string" && f.trim())
        : [],
    });

    return NextResponse.json({ success: true, message: "تم تحديث الباقة بنجاح" });
  } catch (e) {
    console.error("Update teacher package error:", e);
    return NextResponse.json({ error: "حدث خطأ أثناء تعديل الباقة" }, { status: 500 });
  }
}
