import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, password, role } = body;

    if (!name || !phone || !email || !password || !role) {
      return NextResponse.json({ success: false, message: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "البريد الإلكتروني مسجل بالفعل" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, phone, email, password: hashedPassword, role, points: 0 },
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      user: { id: user.id, name: user.name, email: user.email, role: user.role, points: user.points },
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
}