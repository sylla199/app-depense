"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/mois", label: "Mois" },
  { href: "/epargne", label: "Épargne" },
  { href: "/projets", label: "Projets" },
  { href: "/reglages", label: "Réglages" },
];

/** Barre d'onglets mobile et tablette (<1024 px). Masquée au-dessus via Tailwind. */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className="tab" aria-current={active ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
