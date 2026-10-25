import { NextResponse } from "next/server";
import { formatZodErrors, requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { ligneUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = ligneUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }

  const owned = await db.line.findFirst({ where: { id, month: { userId } } });
  if (!owned) return NextResponse.json({ error: "non_trouvée" }, { status: 404 });

  if (parsed.data.categoryId) {
    const category = await db.category.findFirst({
      where: { id: parsed.data.categoryId, userId },
    });
    if (!category) {
      return NextResponse.json({ errors: { categoryId: "Catégorie introuvable." } }, { status: 400 });
    }
  }

  const line = await db.line.update({
    where: { id },
    data: {
      ...parsed.data,
      actual: parsed.data.actual === undefined ? undefined : parsed.data.actual,
    },
  });
  return NextResponse.json({ ok: true, line });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const owned = await db.line.findFirst({ where: { id, month: { userId } } });
  if (!owned) return NextResponse.json({ error: "non_trouvée" }, { status: 404 });

  await db.line.delete({ where: { id } });
  return NextResponse.json({ ok: true, line: owned });
}
