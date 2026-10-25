import { NextResponse } from "next/server";
import { formatZodErrors, requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { compteEpargneCreateSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const body = await request.json().catch(() => null);
  const parsed = compteEpargneCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }

  const account = await db.savingsAccount.create({ data: { userId, ...parsed.data } });
  return NextResponse.json({ ok: true, account });
}
