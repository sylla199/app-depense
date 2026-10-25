import Image from "next/image";
import Link from "next/link";
import { ConfidentialiteManager } from "@/components/legal/ConfidentialiteManager";

export default function ConfidentialitePage() {
  return (
    <div className="pub" style={{ minHeight: "100vh" }}>
      <header className="pub-head">
        <Link href="/" className="topnav-brand">
          <Image src="/icons/icon-48.png" alt="" width={32} height={32} />
          Dépenses
        </Link>
        <Link href="/" className="btn btn-secondary btn-sm">
          Retour à l&apos;accueil
        </Link>
      </header>
      <main className="pub-main">
        <ConfidentialiteManager />
      </main>
      <footer className="pub-foot">
        <Link href="/#aide">Aide</Link>
        <Link href="/confidentialite">Confidentialité</Link>
        <Link href="/confidentialite#conditions">Conditions</Link>
        <Link href="/confidentialite#cookies">Cookies</Link>
        <span style={{ display: "inline-flex", alignItems: "center", minHeight: 44 }}>© Dépenses 2026</span>
      </footer>
    </div>
  );
}
