"use client";

import { useEffect } from "react";

/** Enregistre le service worker (public/sw.js) une fois, côté client. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Hors ligne au premier chargement, navigateur sans support, etc. :
        // l'app continue de fonctionner normalement, juste sans mode hors ligne.
      });
    }
  }, []);
  return null;
}
