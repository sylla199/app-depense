import { NextResponse } from "next/server";
import { formatZodErrors, requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { elementProjetUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = elementProjetUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }

  const owned = await db.projectItem.findFirst({ where: { id, project: { userId } } });
  if (!owned) return NextResponse.json({ error: "non_trouvé" }, { status: 404 });

  const item = await db.projectItem.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const owned = await db.projectItem.findFirst({ where: { id, project: { userId } } });
  if (!owned) return NextResponse.json({ error: "non_trouvé" }, { status: 404 });

  await db.projectItem.delete({ where: { id } });
  return NextResponse.json({ ok: true, item: owned });
}
