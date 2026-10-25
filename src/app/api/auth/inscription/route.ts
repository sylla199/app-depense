import { NextResponse } from "next/server";
import { createSessionCookie, hashPassword } from "@/lib/auth";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { db } from "@/lib/db";
import { formatZodErrors } from "@/lib/api-helpers";
import { MESSAGES, inscriptionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = inscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: formatZodErrors(parsed.error.issues) },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { errors: { email: MESSAGES.emailDejaUtilise } },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      consentAcceptedAt: new Date(),
      categories: {
        create: DEFAULT_CATEGORIES.map((c) => ({
          name: c.name,
          kind: c.kind,
          color: c.color,
          defaultPercent: c.defaultPercent,
          order: c.order,
        })),
      },
    },
  });

  await createSessionCookie(user.id);
  return NextResponse.json({ ok: true });
}
