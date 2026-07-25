import { NextResponse } from "next/server";

const products = [
  { id: 1, name: "كشكول سلك", price: 15, image: "" },
  { id: 2, name: "قلم رصاص", price: 5, image: "" },
  { id: 3, name: "ألوان خشبية", price: 25, image: "" },
  { id: 4, name: "مسطرة", price: 8, image: "" },
  { id: 5, name: "ممحاة", price: 3, image: "" },
  { id: 6, name: "مقص", price: 12, image: "" },
];

export async function GET() {
  return NextResponse.json({ success: true, data: products });
}
