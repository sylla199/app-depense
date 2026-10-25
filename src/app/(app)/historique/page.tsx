import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { revenuDuMois, totalAffecte, epargneMensuelle, fondsUrgence, totalDepense, type LineLike, type CategoryLike } from "@/lib/calculations";
import { HistoriqueManager } from "@/components/historique/HistoriqueManager";

export default async function HistoriquePage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const { userId } = session;

  const [months, sources, categories, savingsAccounts] = await Promise.all([
    db.month.findMany({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { lines: true },
    }),
    db.revenueSource.findMany({ where: { userId } }),
    db.category.findMany({ where: { userId } }),
    db.savingsAccount.findMany({ where: { userId } }),
  ]);

  const revenuActuel = revenuDuMois(sources);
  const categoriesLike: CategoryLike[] = categories.map((c) => ({ id: c.id, kind: c.kind }));

  const items = months.map((m) => {
    const lines: LineLike[] = m.lines.map((l) => ({
      categoryId: l.categoryId,
      planned: l.planned,
      actual: l.actual,
      countsInProjection: l.countsInProjection,
    }));
    const revenu = m.revenueSnapshot ?? revenuActuel;
    const affecte = totalAffecte(lines);
    return {
      id: m.id,
      year: m.year,
      month: m.month,
      revenu,
      restant: revenu - affecte,
      lineCount: m.lines.length,
    };
  });

  // Série de mois bouclés d'affilée, en partant du plus récent (les mois
  // sont déjà triés du plus récent au plus ancien).
  let serie = 0;
  for (const it of items) {
    if (it.restant === 0) serie += 1;
    else break;
  }

  const dernierMois = months[0] ?? null;
  const dernieresLignes: LineLike[] = (dernierMois?.lines ?? []).map((l) => ({
    categoryId: l.categoryId,
    planned: l.planned,
    actual: l.actual,
    countsInProjection: l.countsInProjection,
  }));
  const aDejaBoucle = items.some((it) => it.restant === 0);
  const aDejaEpargne = epargneMensuelle(dernieresLignes, categoriesLike) > 0;
  const urgenceAtteinte =
    fondsUrgence(
      savingsAccounts.map((a) => ({ balance: a.balance, includeInProjection: a.includeInProjection })),
      totalDepense(dernieresLignes, categoriesLike)
    ) >= 3;

  return (
    <HistoriqueManager
      months={items}
      badges={{
        moisBoucle: aDejaBoucle,
        premiereEpargne: aDejaEpargne,
        objectifAtteint: urgenceAtteinte,
        serieDe3: serie >= 3,
      }}
      serie={serie}
    />
  );
}
