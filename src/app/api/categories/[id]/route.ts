import { NextResponse } from "next/server";
import { formatZodErrors, requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { categorieDeleteSchema, categorieUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = categorieUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }

  const owned = await db.category.findFirst({ where: { id, userId } });
  if (!owned) return NextResponse.json({ error: "non_trouvée" }, { status: 404 });

  const category = await db.category.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, category });
}

/**
 * Supprime une catégorie. Si elle contient des lignes (dans n'importe quel
 * mois), `reassignToCategoryId` est obligatoire : les lignes sont déplacées
 * avant la suppression ("Supprimer et déplacer", règle du handoff).
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const owned = await db.category.findFirst({ where: { id, userId } });
  if (!owned) return NextResponse.json({ error: "non_trouvée" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const parsed = categorieDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }

  const lineCount = await db.line.count({ where: { categoryId: id } });
  if (lineCount > 0) {
    const targetId = parsed.data.reassignToCategoryId;
    if (!targetId) {
      return NextResponse.json(
        {
          error: "réaffectation_requise",
          message: "Cette catégorie contient des lignes : indique où les réaffecter.",
          lineCount,
        },
        { status: 409 }
      );
    }
    const target = await db.category.findFirst({ where: { id: targetId, userId } });
    if (!target) {
      return NextResponse.json(
        { errors: { reassignToCategoryId: "Catégorie de destination introuvable." } },
        { status: 400 }
      );
    }
    await db.$transaction([
      db.line.updateMany({ where: { categoryId: id }, data: { categoryId: targetId } }),
      db.category.delete({ where: { id } }),
    ]);
    return NextResponse.json({ ok: true, reassigned: lineCount });
  }

  await db.category.delete({ where: { id } });
  return NextResponse.json({ ok: true, reassigned: 0 });
}
