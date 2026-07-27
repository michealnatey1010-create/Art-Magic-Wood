import { NextResponse } from "next/server";
import { createNotification } from "@/lib/db/mutations";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  await createNotification(data);
  return NextResponse.json({ success: true });
}