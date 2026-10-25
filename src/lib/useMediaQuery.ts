"use client";

import { useSyncExternalStore } from "react";

/** `true` quand la media query correspond. Client uniquement (useSyncExternalStore). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false // rendu serveur : on suppose "ne correspond pas" (desktop-first), corrigé à l'hydratation.
  );
}
