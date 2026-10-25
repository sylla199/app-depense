import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateMoisCourant } from "@/lib/month";
import { revenuDuMois } from "@/lib/calculations";
import { ImportWizard } from "@/components/import/ImportWizard";

export default async function ImporterPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const { userId } = session;

  const [sources, categories, mois] = await Promise.all([
    db.revenueSource.findMany({ where: { userId } }),
    db.category.findMany({ where: { userId } }),
    (async () => {
      const m = await getOrCreateMoisCourant(userId);
      return db.month.findUnique({ where: { id: m.id }, include: { lines: true } });
    })(),
  ]);

  return (
    <ImportWizard
      existing={{
        revenu: revenuDuMois(sources),
        existingCategoryNames: categories.map((c) => c.name),
        currentLines: (mois?.lines ?? []).map((l) => ({
          categoryId: l.categoryId,
          planned: l.planned,
          actual: l.actual,
        })),
      }}
    />
  );
}
