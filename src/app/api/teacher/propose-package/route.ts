import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { teacherId, packageDetails } = await req.json();

    if (!teacherId || !packageDetails) {
      return NextResponse.json({ success: false, message: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const teacher = db.prepare("SELECT id, name, phone, email FROM users WHERE id = ?").get(teacherId) as any;
    if (!teacher) {
      return NextResponse.json({ success: false, message: "المعلم غير موجود" }, { status: 404 });
    }

    const id = crypto.randomBytes(16).toString("hex");
    db.prepare("INSERT INTO package_proposals (id, teacher_name, teacher_phone, teacher_email, package_details, status, teacher_id) VALUES (?, ?, ?, ?, ?, 'pending', ?)")
      .run(id, teacher.name, teacher.phone, teacher.email || "", packageDetails, teacherId);

    const proposal = db.prepare("SELECT * FROM package_proposals WHERE id = ?").get(id);

    return NextResponse.json({ success: true, message: "تم إرسال الاقتراح بنجاح", data: proposal });
  } catch (error) {
    console.error("Proposal error:", error);
    return NextResponse.json({ success: false, message: "حدث خطأ: " + (error as Error).message }, { status: 500 });
  }
}
