import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const proposals = await prisma.packageProposal.findMany({
    orderBy: { created_at: "desc" },
    include: {
      teacher: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: proposals.map((p) => ({
      id: p.id,
      teacher_name: p.teacher_name,
      teacher_phone: p.teacher_phone,
      teacher_email: p.teacher_email,
      package_details: p.package_details,
      status: p.status,
      created_at: p.created_at,
    })),
  });
}

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
