"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/mois", label: "Mois" },
  { href: "/epargne", label: "Épargne" },
  { href: "/projets", label: "Projets" },
  { href: "/reglages", label: "Réglages" },
];

/** Barre latérale bureau (≥1024 px). Masquée en dessous via Tailwind. */
export function SideNav() {
  const pathname = usePathname();
  return (
    <nav className="sidenav" aria-label="Navigation principale">
      <div className="label" style={{ padding: "0 12px", marginBottom: 8 }}>
        Gérer mes dépenses
      </div>
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="nav-item"
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
      <Link href="/historique" className="nav-item" aria-disabled="true" style={{ opacity: 0.4 }}>
        Historique
      </Link>
    </nav>
  );
}
