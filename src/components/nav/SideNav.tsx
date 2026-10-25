"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/mois", label: "Mois" },
  { href: "/epargne", label: "Épargne" },
  { href: "/projets", label: "Projets" },
  { href: "/reglages", label: "Réglages" },
  { href: "/historique", label: "Historique" },
];

/** Barre latérale bureau (≥1024 px) ; `.sidenav` se masque en dessous via components.css. */
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
    </nav>
  );
}
