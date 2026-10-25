import { NextResponse } from "next/server";
import { formatZodErrors, requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { categorieCreateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const body = await request.json().catch(() => null);
  const parsed = categorieCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }

  const maxOrder = await db.category.aggregate({
    where: { userId },
    _max: { order: true },
  });

  const category = await db.category.create({
    data: {
      userId,
      name: parsed.data.name,
      color: parsed.data.color,
      kind: "CUSTOM",
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
  return NextResponse.json({ ok: true, category });
}
