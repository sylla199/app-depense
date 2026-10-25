"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { IconChevronLeft } from "@/components/ui/Icons";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

interface ReglagesManagerProps {
  email: string;
  discreetMode: boolean;
  reduceMotion: boolean;
}

/** Réglages — fidèle à `Reglages.dc.html`. */
export function ReglagesManager({ email, discreetMode, reduceMotion }: ReglagesManagerProps) {
  const router = useRouter();
  const online = useOnlineStatus();
  const [discreet, setDiscreet] = useState(discreetMode);
  const [reduce, setReduce] = useState(reduceMotion);
  const [exported, setExported] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function patchPreferences(data: Record<string, boolean>) {
    await fetch("/api/compte", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
  }

  function onToggleDiscreet(next: boolean) {
    setDiscreet(next);
    patchPreferences({ discreetMode: next });
  }

  function onToggleReduce(next: boolean) {
    setReduce(next);
    patchPreferences({ reduceMotion: next });
  }

  function onExport() {
    // Déclenche un téléchargement de fichier (Content-Disposition: attachment),
    // pas une navigation interne : router.push() ne ferait rien ici.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/compte/export";
    setExported(true);
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

  async function onDeconnexion() {
    await fetch("/api/auth/deconnexion", { method: "POST" });
    router.push("/connexion");
    router.refresh();
  }

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div className="screen-head">
        <h1 className="screen-title">Réglages</h1>
      </div>

      <div className="cols-2">
        <div className="stack" style={{ gap: "var(--space-6)" }}>
          <section className="card">
            <h2 className="label" style={{ margin: "0 0 var(--space-2)" }}>
              Préférences
            </h2>
            <div className="settings-row">
              <div className="row-main">
                <div className="row-title">Devise</div>
                <div className="row-sub">Montants entiers, sans décimales</div>
              </div>
              <span className="caption">FCFA</span>
            </div>
            <div className="settings-row">
              <div className="row-main">
                <div className="row-title">Mode discret</div>
                <div className="row-sub">Masque les montants quand tu es en public</div>
                {discreet ? (
                  <div className="row-sub" aria-live="polite" style={{ color: "var(--ink)" }}>
                    Les montants s&apos;affichent ainsi : •••••• FCFA
                  </div>
                ) : null}
              </div>
              <Switch checked={discreet} onChange={onToggleDiscreet} label="Mode discret" />
            </div>
            <div className="settings-row">
              <div className="row-main">
                <div className="row-title">Réduire les animations</div>
                <div className="row-sub">Remplace aussi le réglage de ton téléphone</div>
              </div>
              <Switch checked={reduce} onChange={onToggleReduce} label="Réduire les animations" />
            </div>
            <div className="settings-row">
              <div className="row-main">
                <div className="row-title">Thème sombre</div>
                <div className="row-sub">Clair pour l&apos;instant</div>
              </div>
              <span className="tag">Bientôt</span>
            </div>
            <div className="settings-row">
              <div className="row-main">
                <div className="row-title">Verrouiller avec un code PIN</div>
                <div className="row-sub">Ou avec ton empreinte ou ton visage</div>
              </div>
              <span className="tag">Bientôt</span>
            </div>
          </section>

          <section className="card">
            <h2 className="label" style={{ margin: "0 0 var(--space-2)" }}>
              Compte
            </h2>
            <div className="settings-row">
              <div className="row-main">
                <div className="row-title">Adresse e-mail</div>
                <div className="row-sub">{email}</div>
              </div>
            </div>
            <Link href="/categories" className="settings-row link-row">
              <div className="row-main">
                <div className="row-title">Catégories</div>
                <div className="row-sub">Renommer, colorer, ajouter ou supprimer</div>
              </div>
              <IconChevronLeft style={{ transform: "rotate(180deg)" }} />
            </Link>
            <Link href="/revenus" className="settings-row link-row">
              <div className="row-main">
                <div className="row-title">Sources de revenu</div>
                <div className="row-sub">Salaire et autres revenus du mois</div>
              </div>
              <IconChevronLeft style={{ transform: "rotate(180deg)" }} />
            </Link>
            <div className="settings-row">
              <div className="row-main">
                <Button variant="ghost" size="sm" style={{ padding: 0 }} onClick={onDeconnexion}>
                  Se déconnecter
                </Button>
              </div>
            </div>
          </section>
        </div>

        <div className="stack" style={{ gap: "var(--space-6)" }}>
          <section className="card">
            <h2 className="label" style={{ margin: "0 0 var(--space-2)" }}>
              Application
            </h2>
            <Link href="/installer" className="settings-row link-row">
              <div className="row-icon" style={{ "--c": "var(--accent)" } as React.CSSProperties}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="6" y="3" width="12" height="18" rx="3" />
                  <path d="M11 18h2" />
                </svg>
              </div>
              <div className="row-main">
                <div className="row-title">Installer l&apos;application</div>
                <div className="row-sub">Android et iPhone, en plein écran</div>
              </div>
              <IconChevronLeft style={{ transform: "rotate(180deg)" }} />
            </Link>
            <Link href="/importer" className="settings-row link-row">
              <div className="row-icon" style={{ "--c": "var(--accent)" } as React.CSSProperties}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 15V4M7 9l5-5 5 5M5 20h14" />
                </svg>
              </div>
              <div className="row-main">
                <div className="row-title">Importer mon tableur</div>
                <div className="row-sub">Dépose ton fichier CSV</div>
              </div>
              <IconChevronLeft style={{ transform: "rotate(180deg)" }} />
            </Link>
          </section>

          <section className="card">
            <h2 className="label" style={{ margin: "0 0 var(--space-2)" }}>
              Mes données
            </h2>
            <div className="settings-row">
              <div className="row-main">
                <div className="row-title">Exporter mes données</div>
                <div className="row-sub" aria-live="polite">
                  {exported ? "Fichier depenses.csv prêt, vérifie tes téléchargements." : "Tous tes mois en CSV"}
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={onExport} disabled={!online}>
                {exported ? "Exporté" : "Exporter"}
              </Button>
            </div>
            <div className="settings-row">
              <div className="row-main">
                <div className="row-title">Supprimer mon compte</div>
                <div className="row-sub">
                  Efface ton compte et toutes tes données. Une confirmation te sera demandée.
                </div>
              </div>
              {!confirmingDelete ? (
                <Button variant="quiet" size="sm" onClick={() => setConfirmingDelete(true)} disabled={!online}>
                  Supprimer
                </Button>
              ) : null}
            </div>
            {confirmingDelete ? (
              <div
                className="card stack"
                role="alertdialog"
                aria-labelledby="acc-del"
                style={{ gap: "var(--space-3)", background: "var(--surface-2)", marginTop: "var(--space-2)" }}
              >
                <div id="acc-del" className="row-title">
                  Supprimer ton compte ?
                </div>
                <div className="caption">
                  Tous tes mois, tes projets et ton épargne seront effacés. Cette action est
                  définitive. Pense à exporter tes données avant.
                </div>
                <div className="wrap">
                  <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>
                    Annuler
                  </Button>
                  <Button variant="solid-ink" size="sm" onClick={onDelete} disabled={deleting}>
                    Supprimer définitivement
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
