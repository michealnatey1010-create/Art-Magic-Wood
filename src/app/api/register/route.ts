import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, password, role, school, storeLocation } = body;

    // التحقق من البيانات المطلوبة
    if (!name || !phone || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    // التحقق من أن البريد الإلكتروني غير مكرر
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني مسجل بالفعل" },
        { status: 409 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        role,
        points: 0,
        school: school || "",
        storeLocation: storeLocation || "",
      },
    });

    // إنشاء التوكن فوراً ليتمكن المستخدم من الشراء دون تسجيل دخول إضافي
    const token = await createToken({ id: user.id, email: user.email, role: user.role });

    return NextResponse.json(
      {
        success: true,
        message: "تم إنشاء الحساب بنجاح",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points,
          school: user.school,
          storeLocation: user.storeLocation,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء التسجيل: " + (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}