import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { IconChevronLeft } from "@/components/ui/Icons";
import { InstallerGuide } from "@/components/pwa/InstallerGuide";

export default async function InstallerPage() {
  const session = await getSession();
  if (!session) redirect("/connexion");

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div className="screen-head">
        <Link href="/reglages" className="back">
          <IconChevronLeft />
          Réglages
        </Link>
      </div>
      <InstallerGuide />
    </div>
  );
}
