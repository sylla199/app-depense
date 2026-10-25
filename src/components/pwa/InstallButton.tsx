"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { InstallGuideContent } from "@/components/pwa/InstallGuideContent";

/** Accessible à tout moment depuis les Réglages (règle du handoff). */
export function InstallButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" block onClick={() => setOpen(true)}>
        Installer l&apos;application
      </Button>
      {open ? (
        <Modal title="Installe l'application" onClose={() => setOpen(false)}>
          <InstallGuideContent />
        </Modal>
      ) : null}
    </>
  );
}
