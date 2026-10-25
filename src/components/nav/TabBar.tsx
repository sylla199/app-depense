"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconEpargne, IconMois, IconProjets, IconReglages } from "@/components/ui/Icons";

const ITEMS = [
  { href: "/mois", label: "Mois", Icon: IconMois },
  { href: "/epargne", label: "Épargne", Icon: IconEpargne },
  { href: "/projets", label: "Projets", Icon: IconProjets },
  { href: "/reglages", label: "Réglages", Icon: IconReglages },
];

/**
 * Barre d'onglets mobile et tablette — 4 entrées (l'Historique n'a pas
 * d'onglet, règle du handoff ; elle vit dans le menu latéral bureau et les
 * liens du Mois). `.tabbar-wrap` se montre sous 1024 px via app-shell.css.
 */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link key={href} href={href} className="tab" aria-current={active ? "page" : undefined}>
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
