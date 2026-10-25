import { NextResponse } from "next/server";
import { createSessionCookie, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { connexionSchema, MESSAGES } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = connexionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: { _global: MESSAGES.identifiantsRefuses } },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  // Message unique, qu'il s'agisse de l'e-mail ou du mot de passe : on ne
  // révèle jamais lequel des deux est faux (règle du handoff).
  if (!user || !valid) {
    return NextResponse.json(
      { errors: { _global: MESSAGES.identifiantsRefuses } },
      { status: 401 }
    );
  }

  await createSessionCookie(user.id);
  const hasOnboarded = (await db.revenueSource.count({ where: { userId: user.id } })) > 0;
  return NextResponse.json({ ok: true, redirectTo: hasOnboarded ? "/mois" : "/premier-lancement" });
}
