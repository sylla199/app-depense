"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconShare } from "@/components/ui/Icons";
import { useInstallPrompt } from "@/lib/useInstallPrompt";

const ANDROID_STEPS = [
  { title: "Ouvre l'application dans Chrome", sub: "Utilise l'adresse que tu as reçue ou ton lien enregistré." },
  {
    title: "Touche « Installer »",
    sub: "Une invitation s'affiche en bas de l'écran. Sinon, ouvre le menu ⋮ puis « Installer l'application ».",
  },
  { title: "Confirme", sub: "L'icône apparaît sur ton écran d'accueil." },
];

const IPHONE_STEPS = [
  { title: "Ouvre l'application dans Safari", sub: "L'installation ne fonctionne pas depuis un autre navigateur." },
  { title: "share", sub: "Le bouton se trouve en bas de l'écran." },
  {
    title: "Choisis « Ajouter à l'écran d'accueil »",
    sub: "Puis touche « Ajouter ». L'icône apparaît sur ton écran d'accueil.",
  },
];

/** Guide d'installation PWA en page complète — fidèle à `Installer.dc.html`. */
export function InstallerGuide() {
  const [os, setOs] = useState<"android" | "iphone">("android");
  const { canInstallNative, promptInstall } = useInstallPrompt();
  const steps = os === "android" ? ANDROID_STEPS : IPHONE_STEPS;

  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: 720 }}>
      <div className="stack" style={{ gap: "var(--space-2)" }}>
        <h1 className="screen-title" style={{ margin: 0 }}>
          Installer l&apos;application
        </h1>
        <p className="muted" style={{ margin: 0 }}>
          Elle s&apos;ouvre en plein écran, comme une application, et tu consultes le mois en cours
          même sans connexion.
        </p>
      </div>

      <div className="pill-nav" role="group" aria-label="Ton téléphone" style={{ alignSelf: "flex-start" }}>
        <button type="button" aria-pressed={os === "android"} onClick={() => setOs("android")}>
          Android
        </button>
        <button type="button" aria-pressed={os === "iphone"} onClick={() => setOs("iphone")}>
          iPhone
        </button>
      </div>

      {os === "android" && canInstallNative ? (
        <Button onClick={promptInstall}>Installer maintenant</Button>
      ) : null}

      <section className="card stack" style={{ padding: "var(--space-6)", gap: "var(--space-6)" }}>
        {steps.map((step, i) => (
          <div key={step.title} className="wrap" style={{ flexWrap: "nowrap", gap: "var(--space-4)", alignItems: "flex-start" }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                flex: "none",
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--accent-soft)",
                color: "var(--accent)",
                font: "600 18px/1 var(--font-display)",
              }}
            >
              {i + 1}
            </span>
            <div className="row-main">
              <div className="row-title" style={{ whiteSpace: "normal", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                {step.title === "share" ? (
                  <>
                    Touche Partager <IconShare style={{ color: "var(--accent)" }} />
                  </>
                ) : (
                  step.title
                )}
              </div>
              <div className="row-sub">{step.sub}</div>
            </div>
          </div>
        ))}
      </section>

      <p className="caption" style={{ margin: 0 }}>
        Ce guide s&apos;affiche une seule fois à ton arrivée. Tu le retrouves ici à tout moment.
      </p>
    </div>
  );
}
