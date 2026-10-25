"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { InstallGuideContent } from "@/components/pwa/InstallGuideContent";
import { isStandalone } from "@/lib/platform";

const SEEN_KEY = "gmd-install-guide-seen";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Affiche le guide d'installation une seule fois à l'arrivée (règle du
 * handoff : "s'affiche une fois puis reste accessible depuis les
 * réglages"). Sur Android, capte `beforeinstallprompt` pour proposer un
 * bouton d'installation natif en un geste ; sur iPhone, Safari n'expose
 * aucune API équivalente — seul le guide existe.
 */
export function InstallManager() {
  const [open, setOpen] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstallNative, setCanInstallNative] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // déjà installée : rien à proposer

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      deferredPrompt.current = event as BeforeInstallPromptEvent;
      setCanInstallNative(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "true";
    } catch {
      // stockage indisponible (navigation privée stricte) : on montre quand même une fois.
    }

    const timer = setTimeout(() => {
      if (!seen) setOpen(true);
    }, 1500); // laisse une chance à beforeinstallprompt de se déclencher avant d'ouvrir

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, "true");
    } catch {}
  }

  async function onInstallClick() {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setCanInstallNative(false);
    close();
  }

  if (!open) return null;

  return (
    <Modal title="Installe l'application" onClose={close}>
      <InstallGuideContent onInstallClick={canInstallNative ? onInstallClick : undefined} />
    </Modal>
  );
}
