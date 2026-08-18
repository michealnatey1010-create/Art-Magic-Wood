import { NextResponse } from "next/server";
import { getPreOrderProducts } from "@/lib/db/queries";
import { createPreOrderProduct, deletePreOrderProduct } from "@/lib/db/mutations";
import { getSession } from "@/lib/auth";
import { notifyAllUsers } from "@/lib/notifications";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getPreOrderProducts());
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const product = await createPreOrderProduct(data);

  try {
    await notifyAllUsers(
      "🛒 منتج جديد في الطلب المسبق",
      `تمت إضافة "${product.name || "منتج جديد"}" — ${product.price} ج.م`,
      { type: "preorder_new", productId: product.id }
    );
  } catch (e) {
    console.error("Preorder notification error:", e);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await deletePreOrderProduct(id);
  return NextResponse.json({ success: true });
}
