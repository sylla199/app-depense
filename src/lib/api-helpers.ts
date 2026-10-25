import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * Exige une session valide pour une route API. Renvoie l'id utilisateur, ou
 * une réponse 401 avec le message "session expirée" du handoff — à utiliser
 * ainsi dans une route : `const auth = await requireUserId(); if (auth instanceof
 * NextResponse) return auth; const { userId } = auth;`
 */
export async function requireUserId(): Promise<{ userId: string } | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      {
        error: "session_expirée",
        message: "Ta session a expiré. Reconnecte-toi pour continuer. Rien n'a été perdu.",
      },
      { status: 401 }
    );
  }
  return { userId: session.userId };
}

/** Formate les erreurs Zod en { field: message } pour l'affichage inline côté client. */
export function formatZodErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "_global";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
