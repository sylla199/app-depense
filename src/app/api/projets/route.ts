import { NextResponse } from "next/server";
import { formatZodErrors, requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { projetCreateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const body = await request.json().catch(() => null);
  const parsed = projetCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }

  const { targetDate, ...rest } = parsed.data;
  const project = await db.project.create({
    data: {
      userId,
      ...rest,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });
  return NextResponse.json({ ok: true, project });
}
