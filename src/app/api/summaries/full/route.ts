import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const levels = await prisma.academicLevel.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      grades: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: {
          subjects: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            include: {
              summaries: { orderBy: { createdAt: "desc" } },
            },
          },
        },
      },
    },
  });

  const data = levels.map((level) => ({
    id: level.id,
    name: level.name,
    order: level.order,
    grades: level.grades.map((grade) => ({
      id: grade.id,
      name: grade.name,
      order: grade.order,
      subjects: grade.subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        order: subject.order,
        summaries: subject.summaries.map((summary) => ({
          id: summary.id,
          name: summary.name,
          description: summary.description,
          price: summary.price,
          image: summary.image,
          stock: summary.stock,
        })),
      })),
    })),
  }));

  return NextResponse.json({ success: true, data });
}