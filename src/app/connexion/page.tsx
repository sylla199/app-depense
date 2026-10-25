import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthForm } from "@/components/auth/AuthForm";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/mois");
  const { mode } = await searchParams;

  return (
    <main id="contenu" style={{ padding: 16 }}>
      <AuthForm initialMode={mode === "inscription" ? "inscription" : "connexion"} />
    </main>
  );
}
