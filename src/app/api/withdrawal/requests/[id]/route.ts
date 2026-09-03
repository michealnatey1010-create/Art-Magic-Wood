import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.role || "").toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { status, adminNotes } = await req.json();

    const validStatuses = ["pending", "approved", "rejected", "completed"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
    }

    const request = await prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!request) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    if (status === "approved" || status === "completed") {
      if (request.status !== "approved" && request.status !== "completed") {
        const user = await prisma.user.findUnique({ where: { id: request.userId } });
        if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

        if (user.points < request.pointsUsed) {
          return NextResponse.json({ error: "الמשخدم لا يملك نقاط كافية" }, { status: 400 });
        }

        await prisma.user.update({
          where: { id: request.userId },
          data: { points: user.points - request.pointsUsed },
        });
      }
    }

    const updated = await prisma.withdrawalRequest.update({
      where: { id },
      data: {
        status: status || request.status,
        adminNotes: adminNotes !== undefined ? adminNotes : request.adminNotes,
      },
      include: { user: { select: { id: true, name: true, email: true, points: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error("Update withdrawal request error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
