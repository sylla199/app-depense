"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function DeconnexionButton() {
  const router = useRouter();
  return (
    <Button
      variant="quiet"
      block
      onClick={async () => {
        await fetch("/api/auth/deconnexion", { method: "POST" });
        router.push("/connexion");
        router.refresh();
      }}
    >
      Se déconnecter
    </Button>
  );
}
