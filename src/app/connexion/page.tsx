import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthForm } from "@/components/auth/AuthForm";

export default async function ConnexionPage() {
  const session = await getSession();
  if (session) redirect("/mois");

  return (
    <main id="contenu" style={{ padding: 16 }}>
      <AuthForm initialMode="connexion" />
    </main>
  );
}
