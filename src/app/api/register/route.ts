import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, message: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return NextResponse.json({ success: false, message: "البريد الإلكتروني مسجل بالفعل" }, { status: 409 });
    }

    const hashed = bcrypt.hashSync(password, 12);
    const id = crypto.randomBytes(16).toString("hex");

    db.prepare("INSERT INTO users (id, name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, name, email, phone || "", hashed, role);

    const user = db.prepare("SELECT id, name, email, phone, role FROM users WHERE id = ?").get(id) as any;

    return NextResponse.json({
      success: true,
      message: "تم التسجيل بنجاح",
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, message: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}
