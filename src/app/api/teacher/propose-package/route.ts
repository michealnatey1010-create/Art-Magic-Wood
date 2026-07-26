import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { teacherId, packageDetails } = await req.json();

    if (!teacherId || !packageDetails) {
      return NextResponse.json({ success: false, message: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { id: true, name: true, phone: true, email: true },
    });
    if (!teacher) {
      return NextResponse.json({ success: false, message: "المعلم غير موجود" }, { status: 404 });
    }

    const proposal = await prisma.packageProposal.create({
      data: {
        teacher_name: teacher.name,
        teacher_phone: teacher.phone || "",
        teacher_email: teacher.email || "",
        package_details: packageDetails,
        status: "pending",
        teacher_id: teacherId,
      },
    });

    return NextResponse.json({ success: true, message: "تم إرسال الاقتراح بنجاح", data: proposal });
  } catch (error) {
    console.error("Proposal error:", error);
    return NextResponse.json({ success: false, message: "حدث خطأ: " + (error as Error).message }, { status: 500 });
  }
}
