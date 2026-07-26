import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { createToken } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db/queries";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = bcryptjs.compareSync(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createToken({ id: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
