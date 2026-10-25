import { NextResponse } from "next/server";
import { formatZodErrors, requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { getOrCreateMoisCourant } from "@/lib/month";
import { importSchema } from "@/lib/validation";

/**
 * Import du tableur (F12, Should) : associe chaque libellé de catégorie du
 * CSV à une catégorie existante (nom, insensible à la casse) ou en crée une
 * nouvelle (couleur `cat-other`, par défaut pour une catégorie utilisateur).
 * Crée les lignes dans le mois courant. "Rien n'est créé avant la
 * validation finale" (règle du handoff) : tout se passe en une seule
 * transaction, déclenchée uniquement par cet appel — jamais pendant
 * l'aperçu, géré côté client avant l'envoi.
 */
export async function POST(request: Request) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const body = await request.json().catch(() => null);
  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }
  const { rows } = parsed.data;

  const [month, existingCategories] = await Promise.all([
    getOrCreateMoisCourant(userId),
    db.category.findMany({ where: { userId } }),
  ]);

  const byNameLower = new Map(existingCategories.map((c) => [c.name.toLowerCase(), c]));
  const maxOrder = existingCategories.reduce((max, c) => Math.max(max, c.order), -1);

  // Catégories à créer : une par libellé du CSV qui ne correspond à aucune
  // catégorie existante, dans l'ordre de première apparition.
  const toCreate: string[] = [];
  const seen = new Set(byNameLower.keys());
  for (const row of rows) {
    const key = row.categoryName.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      toCreate.push(row.categoryName);
    }
  }

  const createdCategories = await db.$transaction(
    toCreate.map((name, i) =>
      db.category.create({
        data: { userId, name, color: "cat-other", kind: "CUSTOM", order: maxOrder + 1 + i },
      })
    )
  );
  for (const c of createdCategories) byNameLower.set(c.name.toLowerCase(), c);

  const maxLineOrder = await db.line.aggregate({
    where: { monthId: month.id },
    _max: { order: true },
  });
  let order = (maxLineOrder._max.order ?? -1) + 1;

  await db.$transaction(
    rows.map((row) => {
      const category = byNameLower.get(row.categoryName.toLowerCase())!;
      return db.line.create({
        data: {
          monthId: month.id,
          categoryId: category.id,
          name: row.name,
          planned: row.planned,
          order: order++,
        },
      });
    })
  );

  return NextResponse.json({
    ok: true,
    categoriesCreated: createdCategories.length,
    linesCreated: rows.length,
  });
}
