import { NextResponse } from "next/server";
import { createNotification } from "@/lib/db/mutations";
import { getSession } from "@/lib/auth";
import { notifyAllUsers } from "@/lib/notifications";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const notification = await createNotification(data);

  try {
    await notifyAllUsers(
      "🔔 منتج متوفر الآن",
      notification.message,
      { type: "preorder_available", productId: notification.product_id }
    );
  } catch (e) {
    console.error("Availability notification error:", e);
  }

  return NextResponse.json({ success: true });
}