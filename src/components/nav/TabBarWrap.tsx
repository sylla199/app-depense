"use client";

import Link from "next/link";
import { TabBar } from "@/components/nav/TabBar";
import { useFabValue } from "@/components/nav/FabContext";
import { IconPlus } from "@/components/ui/Icons";

/**
 * `.tabbar-wrap` : la barre d'onglets, avec le bouton flottant de la page
 * courante ancré juste au-dessus (`.fab.fab-pos`, voir `Mois.dc.html` /
 * `Categorie.dc.html`) — jamais un bouton flottant à chaque page.
 */
export function TabBarWrap() {
  const fab = useFabValue();
  return (
    <div className="tabbar-wrap">
      {fab ? (
        fab.href ? (
          <Link className="fab fab-pos" href={fab.href} aria-label={fab.label}>
            <IconPlus />
          </Link>
        ) : (
          <button type="button" className="fab fab-pos" aria-label={fab.label} onClick={fab.onClick}>
            <IconPlus />
          </button>
        )
      ) : null}
      <TabBar />
    </div>
  );
}
