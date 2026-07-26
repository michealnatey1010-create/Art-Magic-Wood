import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMerchantProducts } from "@/lib/db/queries";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");
  if (!vendorId) return NextResponse.json({ error: "vendorId required" }, { status: 400 });
  return NextResponse.json(await getMerchantProducts(vendorId));
}
