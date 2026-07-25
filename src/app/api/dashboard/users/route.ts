import { NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/lib/db/queries";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  return NextResponse.json(getUsers(search));
}
