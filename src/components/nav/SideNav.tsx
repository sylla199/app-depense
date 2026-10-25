"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconEpargne,
  IconHistorique,
  IconMois,
  IconProjets,
  IconRappels,
  IconReglages,
  IconSimulation,
} from "@/components/ui/Icons";

const ITEMS = [
  { href: "/mois", label: "Mois", Icon: IconMois },
  { href: "/historique", label: "Historique", Icon: IconHistorique },
  { href: "/epargne", label: "Épargne", Icon: IconEpargne },
  { href: "/projets", label: "Projets", Icon: IconProjets },
];

/**
 * Barre latérale bureau — structure fidèle au canvas (`Mois.dc.html` etc.) :
 * logo + marque, Mois/Historique/Épargne/Projets, séparateur, Simulation et
 * Rappels désactivés avec un tag "Bientôt" (V2), séparateur, Réglages.
 * `.sidenav` se masque sous 1024 px via app-shell.css (`.app .sidenav`).
 */
export function SideNav() {
  const pathname = usePathname();
  return (
    <nav className="sidenav" aria-label="Navigation principale">
      <div className="sidenav-brand">
        <Image src="/icons/icon-48.png" alt="" width={32} height={32} />
        Gérer mes dépenses
      </div>
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link key={href} href={href} className="nav-item" aria-current={active ? "page" : undefined}>
            <Icon />
            {label}
          </Link>
        );
      })}
      <div className="nav-sep" />
      <span className="nav-item" aria-disabled="true">
        <IconSimulation />
        Simulation
        <span className="tag">Bientôt</span>
      </span>
      <span className="nav-item" aria-disabled="true">
        <IconRappels />
        Rappels
        <span className="tag">Bientôt</span>
      </span>
      <div className="nav-sep" />
      <Link
        href="/reglages"
        className="nav-item"
        aria-current={pathname.startsWith("/reglages") || pathname.startsWith("/categories") || pathname.startsWith("/revenus") ? "page" : undefined}
      >
        <IconReglages />
        Réglages
      </Link>
    </nav>
  );
}
