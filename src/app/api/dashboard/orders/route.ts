import { NextResponse } from "next/server";
import { getOrders } from "@/lib/db/queries";
import { createOrder, updateOrderStatus, deleteOrder } from "@/lib/db/mutations";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source") || undefined;
  return NextResponse.json(await getOrders(source));
}

export async function POST(r: Request) {
  const session = await getSession(r);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await r.json();
  await createOrder(data);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const { status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "ID and status required" }, { status: 400 });
  await updateOrderStatus(id, status);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await deleteOrder(id);
  return NextResponse.json({ success: true });
}