"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface FabConfig {
  label: string;
  onClick?: () => void;
  href?: string;
}

const FabContext = createContext<{
  fab: FabConfig | null;
  setFab: (fab: FabConfig | null) => void;
} | null>(null);

export function FabProvider({ children }: { children: ReactNode }) {
  const [fab, setFab] = useState<FabConfig | null>(null);
  const value = useMemo(() => ({ fab, setFab }), [fab]);
  return <FabContext.Provider value={value}>{children}</FabContext.Provider>;
}

/**
 * Enregistre le bouton flottant "Ajouter une ligne" de la page courante.
 * Le vrai bouton (`.fab.fab-pos`) vit dans `.tabbar-wrap` (TabBarWrap),
 * ancré juste au-dessus de la barre d'onglets comme dans le canvas — une
 * page ne fait qu'y déposer sa config, jamais son propre bouton flottant.
 */
export function useFab(config: FabConfig | null) {
  const ctx = useContext(FabContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setFab(config);
    return () => ctx.setFab(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.label, config?.href, config?.onClick]);
}

export function useFabValue() {
  const ctx = useContext(FabContext);
  return ctx?.fab ?? null;
}
