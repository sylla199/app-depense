"use client";

import Image from "next/image";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Fonctions", href: "#fonctions" },
  { label: "Projets d'achat", href: "#projets" },
  { label: "Simulateur", href: "#simulateur" },
  { label: "Sécurité", href: "#securite" },
  { label: "Aide", href: "#aide" },
];

/** Barre de navigation collante de la landing — fidèle à `Landing.dc.html` (section TopNav). */
export function TopNav({ signupHref }: { signupHref: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-base)" }}>
      <div className="topnav">
        <a className="topnav-brand" href="#top">
          <Image src="/icons/icon-48.png" alt="" width={32} height={32} />
          <span className="brand-name">Dépenses</span>
        </a>
        <nav className="topnav-menu" aria-label="Navigation principale">
          {NAV_ITEMS.map((n) => (
            <a key={n.href} href={n.href} aria-current={active === n.href ? "page" : undefined} onClick={() => setActive(n.href)}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="topnav-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm only-mobile"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Ouvrir le menu"
          >
            Menu
          </button>
          <a className="btn btn-primary btn-sm" href={signupHref}>
            Créer mon espace
          </a>
        </div>
      </div>
      {menuOpen ? (
        <nav className="mobile-menu" aria-label="Menu mobile">
          {NAV_ITEMS.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>
              {n.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
