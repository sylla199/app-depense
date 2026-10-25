import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { moisEcoulesDepuis } from "@/lib/month";
import {
  contributionsAccumulees,
  epargnePourProjet,
  moisRestantsProjet,
  progression,
  resteAFinancer,
  totalProjet,
} from "@/lib/calculations";
import { ProjetDetail } from "@/components/projets/ProjetDetail";

export default async function ProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const { id } = await params;

  const project = await db.project.findFirst({
    where: { id, userId: session.userId },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  if (!project) notFound();

  const total = totalProjet(project.items);
  const contributions = contributionsAccumulees(
    project.monthlyContribution,
    moisEcoulesDepuis(project.createdAt)
  );
  const epargne = epargnePourProjet(project.initialSaved, contributions);
  const reste = resteAFinancer(total, epargne);

  return (
    <ProjetDetail
      project={{
        id: project.id,
        name: project.name,
        initialSaved: project.initialSaved,
        monthlyContribution: project.monthlyContribution,
        targetDate: project.targetDate ? project.targetDate.toISOString().slice(0, 10) : "",
        archived: project.archived,
        total,
        epargne,
        reste,
        progression: progression(epargne, total),
        moisRestants: moisRestantsProjet(reste, project.monthlyContribution),
      }}
      items={project.items.map((it) => ({
        id: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        link: it.link,
        note: it.note,
        purchased: it.purchased,
      }))}
    />
  );
}
