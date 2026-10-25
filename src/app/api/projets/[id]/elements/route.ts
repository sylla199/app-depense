import { NextResponse } from "next/server";
import { formatZodErrors, requireUserId } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { elementProjetCreateSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id: projectId } = await params;

  const project = await db.project.findFirst({ where: { id: projectId, userId } });
  if (!project) return NextResponse.json({ error: "non_trouvé" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = elementProjetCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: formatZodErrors(parsed.error.issues) }, { status: 400 });
  }

  const item = await db.projectItem.create({ data: { projectId, ...parsed.data } });
  return NextResponse.json({ ok: true, item });
}
