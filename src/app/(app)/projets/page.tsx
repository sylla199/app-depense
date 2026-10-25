import { redirect } from "next/navigation";
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
import { ProjetsManager } from "@/components/projets/ProjetsManager";

export default async function ProjetsPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const projects = await db.project.findMany({
    where: { userId: session.userId, archived: false },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const items = projects.map((p) => {
    const total = totalProjet(p.items);
    const contributions = contributionsAccumulees(p.monthlyContribution, moisEcoulesDepuis(p.createdAt));
    const epargne = epargnePourProjet(p.initialSaved, contributions);
    const reste = resteAFinancer(total, epargne);
    return {
      id: p.id,
      name: p.name,
      total,
      epargne,
      reste,
      progression: progression(epargne, total),
      moisRestants: moisRestantsProjet(reste, p.monthlyContribution),
      contributionMensuelle: p.monthlyContribution,
    };
  });

  return <ProjetsManager projects={items} />;
}
