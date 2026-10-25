import { NextResponse } from "next/server";
import { formatZodErrors, requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { projetUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = projetUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }

  const owned = await db.project.findFirst({ where: { id, userId } });
  if (!owned) return NextResponse.json({ error: "non_trouvé" }, { status: 404 });

  const { targetDate, ...rest } = parsed.data;
  const project = await db.project.update({
    where: { id },
    data: {
      ...rest,
      ...(targetDate !== undefined ? { targetDate: targetDate ? new Date(targetDate) : null } : {}),
    },
  });
  return NextResponse.json({ ok: true, project });
}

/** Supprime un projet et ses éléments (cascade). Utilisé par "Archiver" côté
 *  UI on préfère PATCH {archived:true} ; DELETE reste pour un nettoyage complet. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const owned = await db.project.findFirst({ where: { id, userId } });
  if (!owned) return NextResponse.json({ error: "non_trouvé" }, { status: 404 });

  await db.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
