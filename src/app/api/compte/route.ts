import { NextResponse } from "next/server";
import { z } from "zod";
import { destroySessionCookie } from "@/lib/auth";
import { formatZodErrors, requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";

const preferencesSchema = z.object({
  reduceMotion: z.boolean().optional(),
  discreetMode: z.boolean().optional(),
});

/** Préférences (F8) : réduire les animations (pleinement câblée, voir
 *  `(app)/layout.tsx`), mode discret (persisté ici, pas encore appliqué à
 *  l'affichage des montants — voir CLAUDE.md). */
export async function PATCH(request: Request) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const body = await request.json().catch(() => null);
  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }

  const user = await db.user.update({ where: { id: userId }, data: parsed.data });
  return NextResponse.json({ ok: true, reduceMotion: user.reduceMotion, discreetMode: user.discreetMode });
}

/**
 * Suppression définitive du compte (F8, Must — RGPD). Toutes les données
 * liées sont supprimées en cascade (`onDelete: Cascade` sur chaque relation
 * du schéma Prisma), sans confirmation supplémentaire côté serveur : c'est
 * la boîte de dialogue côté client ("Supprimer définitivement") qui porte
 * la confirmation, irréversible.
 */
export async function DELETE() {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  await db.user.delete({ where: { id: userId } });
  await destroySessionCookie();
  return NextResponse.json({ ok: true });
}
