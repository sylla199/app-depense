"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export interface FabConfig {
  label: string;
  onClick?: () => void;
  href?: string;
}

// Deux contextes séparés à dessein : le setter (FabSetterContext) est une
// fonction useState, donc STABLE sur toute la vie du Provider ; la valeur
// (FabValueContext) change à chaque bouton enregistré, pour re-rendre
// TabBarWrap. Un seul contexte combinant les deux ferait dépendre la
// fonction d'enregistrement (useFab) d'un objet qui change avec la valeur
// — l'effet se redéclencherait à chaque changement, boucle infinie
// ("Maximum update depth exceeded", trouvé en testant cet écran).
const FabValueContext = createContext<FabConfig | null>(null);
const FabSetterContext = createContext<((fab: FabConfig | null) => void) | null>(null);

export function FabProvider({ children }: { children: ReactNode }) {
  const [fab, setFab] = useState<FabConfig | null>(null);
  return (
    <FabSetterContext.Provider value={setFab}>
      <FabValueContext.Provider value={fab}>{children}</FabValueContext.Provider>
    </FabSetterContext.Provider>
  );
}

/**
 * Enregistre le bouton flottant "Ajouter une ligne" de la page courante.
 * Le vrai bouton (`.fab.fab-pos`) vit dans `.tabbar-wrap` (TabBarWrap),
 * ancré juste au-dessus de la barre d'onglets comme dans le canvas — une
 * page ne fait qu'y déposer sa config, jamais son propre bouton flottant.
 *
 * `onClick` passé inline (`() => ...`) change de référence à chaque rendu :
 * l'effet ne dépend donc que de `label`/`href`/la présence d'un `onClick`
 * (des primitives stables) et de `setFab` (stable, c'est un setState), et
 * appelle toujours la dernière fonction via une ref.
 */
export function useFab(config: FabConfig | null) {
  const setFab = useContext(FabSetterContext);
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

  useEffect(() => {
    if (!setFab) return;
    const current = configRef.current;
    setFab(
      current
        ? {
            label: current.label,
            href: current.href,
            onClick: current.onClick ? () => configRef.current?.onClick?.() : undefined,
          }
        : null
    );
    return () => setFab(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFab, config?.label, config?.href, !!config?.onClick]);
}

export function useFabValue(): FabConfig | null {
  return useContext(FabValueContext);
}
