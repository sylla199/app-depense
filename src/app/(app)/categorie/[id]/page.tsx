import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrCreateMoisCourant } from "@/lib/month";
import { CategorieDetail } from "@/components/categorie/CategorieDetail";

export default async function CategoriePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const { id } = await params;

  const category = await db.category.findFirst({ where: { id, userId: session.userId } });
  if (!category) notFound();

  const mois = await getOrCreateMoisCourant(session.userId);
  const [lines, categories] = await Promise.all([
    db.line.findMany({ where: { monthId: mois.id, categoryId: id }, orderBy: { order: "asc" } }),
    db.category.findMany({ where: { userId: session.userId }, orderBy: { order: "asc" } }),
  ]);

  const totalPlanned = lines.reduce((sum, l) => sum + l.planned, 0);

  return (
    <CategorieDetail
      category={{ id: category.id, name: category.name }}
      lines={lines.map((l) => ({
        id: l.id,
        name: l.name,
        planned: l.planned,
        actual: l.actual,
        isFixed: l.isFixed,
        countsInProjection: l.countsInProjection,
        categoryId: l.categoryId,
      }))}
      categories={categories.map((c) => ({ id: c.id, name: c.name, kind: c.kind }))}
      totalPlanned={totalPlanned}
    />
  );
}
