import { NextResponse } from "next/server";
import { formatZodErrors, requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { getOrCreateMoisCourant } from "@/lib/month";
import { ligneCreateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const body = await request.json().catch(() => null);
  const parsed = ligneCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }

  const category = await db.category.findFirst({
    where: { id: parsed.data.categoryId, userId },
  });
  if (!category) {
    return NextResponse.json({ errors: { categoryId: "Catégorie introuvable." } }, { status: 400 });
  }

  const month = await getOrCreateMoisCourant(userId);
  const maxOrder = await db.line.aggregate({
    where: { monthId: month.id, categoryId: category.id },
    _max: { order: true },
  });

  const line = await db.line.create({
    data: {
      monthId: month.id,
      categoryId: category.id,
      name: parsed.data.name,
      planned: parsed.data.planned,
      actual: parsed.data.actual ?? null,
      isFixed: parsed.data.isFixed,
      countsInProjection: parsed.data.countsInProjection,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
  return NextResponse.json({ ok: true, line });
}
