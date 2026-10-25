import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PremierLancementWizard } from "@/components/auth/PremierLancementWizard";

export default async function PremierLancementPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const hasOnboarded = (await db.revenueSource.count({ where: { userId: session.userId } })) > 0;
  if (hasOnboarded) redirect("/mois");

  const categories = await db.category.findMany({
    where: { userId: session.userId },
    orderBy: { order: "asc" },
  });

  return (
    <main id="contenu" style={{ padding: 16 }}>
      <PremierLancementWizard
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          defaultPercent: c.defaultPercent ?? 0,
        }))}
      />
    </main>
  );
}
