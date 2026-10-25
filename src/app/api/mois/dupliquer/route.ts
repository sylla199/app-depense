import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api-helpers";
import { dupliquerMoisPrecedent } from "@/lib/month";

export async function POST() {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const month = await dupliquerMoisPrecedent(userId);
  if (!month) {
    return NextResponse.json(
      { error: "aucun_mois", message: "Aucun mois à dupliquer." },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true, month });
}
