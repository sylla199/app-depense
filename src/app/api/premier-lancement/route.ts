import { NextResponse } from "next/server";
import { requireUserId, formatZodErrors } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { getOrCreateMoisCourant } from "@/lib/month";
import { premierLancementSchema } from "@/lib/validation";

/**
 * Parcours "Premier lancement" (F10) : revenu du mois, répartition type
 * (affichée côté client, ajustable ligne par ligne par la suite), puis
 * première ligne de dépense. Crée la source de revenu, le mois courant et
 * la première ligne en une seule opération.
 */
export async function POST(request: Request) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const body = await request.json().catch(() => null);
  const parsed = premierLancementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }
  const { revenu, premiereLigne } = parsed.data;

  const category = await db.category.findFirst({
    where: { id: premiereLigne.categoryId, userId },
  });
  if (!category) {
    return NextResponse.json(
      { errors: { "premiereLigne.categoryId": "Catégorie introuvable." } },
      { status: 400 }
    );
  }

  const month = await getOrCreateMoisCourant(userId);

  await db.$transaction([
    db.revenueSource.create({
      data: { userId, name: "Revenu du mois", amount: revenu, carryOver: true },
    }),
    db.line.create({
      data: {
        monthId: month.id,
        categoryId: category.id,
        name: premiereLigne.name,
        planned: premiereLigne.planned,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
