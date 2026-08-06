import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get("merchantId") || undefined;

  const records = await prisma.merchantInventory.findMany({
    where: merchantId ? { merchant_id: merchantId } : undefined,
    orderBy: { created_at: "desc" },
    include: {
      merchant: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  const data = records.map((r) => ({
    id: r.id,
    merchantId: r.merchant_id,
    merchantName: r.merchant?.name || "",
    merchantEmail: r.merchant?.email || "",
    storeName: r.store_name,
    storeAddress: r.store_address,
    phone: r.phone,
    fileUrl: r.file_url,
    fileName: r.file_name,
    status: r.status,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ success: true, data });
}