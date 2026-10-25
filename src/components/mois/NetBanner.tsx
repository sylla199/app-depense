"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getQueue, queueLength, removeFromQueue } from "@/lib/offlineQueue";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

/**
 * Bandeau réseau du Mois (section "Hors ligne et synchronisation" du
 * handoff) : "Tu es hors ligne" avec le nombre d'ajouts en attente, puis
 * "Synchronisation en cours" au retour du réseau, le temps de renvoyer la
 * file des lignes ajoutées hors ligne.
 */
export function NetBanner() {
  const router = useRouter();
  const online = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [pending, setPending] = useState(0);
  const syncingRef = useRef(false);

  // La file (localStorage) n'existe pas côté serveur : on la lit au montage
  // puis à chaque bascule en ligne/hors ligne, jamais pendant le rendu
  // serveur (valeur par défaut 0, corrigée ici dès que le client existe).
  // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronisation avec localStorage, inexistant côté serveur
  useEffect(() => setPending(queueLength()), [online]);

  useEffect(() => {
    if (!online || syncingRef.current) return;
    const queue = getQueue();
    if (queue.length === 0) return;

    let cancelled = false;
    async function sync() {
      syncingRef.current = true;
      setSyncing(true);
      for (const line of getQueue()) {
        if (cancelled) break;
        try {
          const res = await fetch("/api/lignes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              categoryId: line.categoryId,
              name: line.name,
              planned: line.planned,
              actual: line.actual,
              isFixed: line.isFixed,
              countsInProjection: line.countsInProjection,
            }),
          });
          if (res.ok) removeFromQueue(line.tempId);
        } catch {
          break; // réseau reperdu en cours de route : on réessaiera au prochain "online"
        }
      }
      syncingRef.current = false;
      if (!cancelled) {
        setSyncing(false);
        setPending(queueLength());
        router.refresh();
      }
    }
    sync();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  if (online && pending === 0 && !syncing) return null;

  if (syncing) {
    return (
      <div className="net-banner" role="status">
        <span className="spin" aria-hidden="true" />
        <span>Synchronisation en cours</span>
        <span className="caption">
          Envoi de {pending > 0 ? pending : "tes"} {pending === 1 ? "ajout" : "ajouts"} faits hors
          ligne.
        </span>
      </div>
    );
  }

  if (!online) {
    return (
      <div className="net-banner" role="status">
        <span>Tu es hors ligne</span>
        <span className="caption">
          Tu peux consulter ce mois et ajouter des lignes. Elles seront envoyées dès le retour du
          réseau.
        </span>
        {pending > 0 ? <span className="tag">{pending} en attente</span> : null}
      </div>
    );
  }

  return null;
}
