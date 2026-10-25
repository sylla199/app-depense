import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateMoisCourant } from "@/lib/month";
import {
  epargneMensuelle,
  fondsUrgence,
  totalDepense,
  type CategoryLike,
  type LineLike,
} from "@/lib/calculations";
import { EpargneManager } from "@/components/epargne/EpargneManager";

export default async function EpargnePage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const { userId } = session;

  const [accounts, mois, categories] = await Promise.all([
    db.savingsAccount.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    (async () => {
      const m = await getOrCreateMoisCourant(userId);
      return db.month.findUnique({ where: { id: m.id }, include: { lines: true } });
    })(),
    db.category.findMany({ where: { userId } }),
  ]);

  const lines: LineLike[] = (mois?.lines ?? []).map((l) => ({
    categoryId: l.categoryId,
    planned: l.planned,
    actual: l.actual,
    countsInProjection: l.countsInProjection,
  }));
  const categoriesLike: CategoryLike[] = categories.map((c) => ({ id: c.id, kind: c.kind }));

  const mensuelle = epargneMensuelle(lines, categoriesLike);
  const depense = totalDepense(lines, categoriesLike);
  const urgence = fondsUrgence(
    accounts.map((a) => ({ balance: a.balance, includeInProjection: a.includeInProjection })),
    depense
  );

  return (
    <EpargneManager
      accounts={accounts.map((a) => ({
        id: a.id,
        name: a.name,
        balance: a.balance,
        monthlyContribution: a.monthlyContribution,
        isLocked: a.isLocked,
        includeInProjection: a.includeInProjection,
      }))}
      epargneMensuelle={mensuelle}
      fondsUrgenceMois={urgence}
      totalDepense={depense}
    />
  );
}
