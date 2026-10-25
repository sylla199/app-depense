"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

/** "Mes données" (F8, Must — RGPD) : export, suppression définitive du compte. */
export function DonneesCard() {
  const router = useRouter();
  const online = useOnlineStatus();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function onExport() {
    // Déclenche un téléchargement de fichier (Content-Disposition: attachment),
    // pas une navigation interne : router.push() ne ferait rien ici.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/compte/export";
  }

  async function onDelete() {
    setDeleting(true);
    try {
      await fetch("/api/compte", { method: "DELETE" });
      router.push("/connexion");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="card">
      <p className="label" style={{ marginBottom: 12 }}>
        Mes données
      </p>
      <Button variant="secondary" block onClick={onExport} disabled={!online} style={{ marginBottom: 12 }}>
        Exporter mes données
      </Button>
      <button
        type="button"
        className="btn btn-ghost btn-block"
        style={{ color: "var(--over)" }}
        onClick={() => setConfirming(true)}
        disabled={!online}
      >
        Supprimer mon compte
      </button>
      {!online ? (
        <p className="caption" style={{ marginTop: 8 }}>
          Ces actions nécessitent une connexion.
        </p>
      ) : null}

      {confirming ? (
        <Modal title="Supprimer ton compte" onClose={() => setConfirming(false)}>
          <p style={{ marginBottom: 8 }}>
            Cette action est <strong>irréversible</strong> : toutes tes données (mois, lignes,
            épargne, projets) seront définitivement supprimées.
          </p>
          <p className="caption" style={{ marginBottom: 16 }}>
            Conseil : exporte tes données avant de continuer.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Annuler
            </Button>
            <Button variant="solid-ink" block onClick={onDelete} disabled={deleting}>
              Supprimer définitivement
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
