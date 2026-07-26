import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, message: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, message: "البريد الإلكتروني مسجل بالفعل" }, { status: 409 });
    }

    const hashed = bcrypt.hashSync(password, 12);

    const user = await prisma.user.create({
      data: { name, email, phone: phone || "", password: hashed, role },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json({
      success: true,
      message: "تم التسجيل بنجاح",
      user,
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}
