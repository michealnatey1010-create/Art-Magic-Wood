import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import * as path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const sub = (formData.get("sub") as string || "").replace(/[^a-z0-9_-]/gi, "");
    const baseDir = path.resolve(process.cwd(), "public/uploads");
    const targetDir = sub ? path.join(baseDir, sub) : baseDir;

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(targetDir, filename), buffer);

    const url = sub ? `/uploads/${sub}/${filename}` : `/uploads/${filename}`;
    console.log("📸 Upload saved →", url);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("❌ Upload failed:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
