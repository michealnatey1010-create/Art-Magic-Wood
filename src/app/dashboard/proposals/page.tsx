import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProposalsClient from "./ProposalsClient";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const proposals = await prisma.packageProposal.findMany({
    orderBy: { created_at: "desc" },
    include: { teacher: true },
  });

  const data = proposals.map((p) => ({
    id: p.id,
    teacher_name: p.teacher ? p.teacher.name : "معلم محذوف",
    teacher_phone: p.teacher_phone,
    teacher_email: p.teacher_email,
    package_details: p.package_details,
    status: p.status,
    created_at: p.created_at.toISOString(),
  }));

  return <ProposalsClient proposals={data} />;
}