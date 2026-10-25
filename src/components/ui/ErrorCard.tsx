import { Button } from "@/components/ui/Button";
import { IconWifiOff } from "@/components/ui/Icons";

interface ErrorCardProps {
  title: string;
  onRetry: () => void;
}

/** Carte d'erreur de chargement — fidèle au gabarit du canvas (`isError` sur Mois.dc.html etc). */
export function ErrorCard({ title, onRetry }: ErrorCardProps) {
  return (
    <div
      className="card stack"
      role="alert"
      style={{ alignItems: "center", textAlign: "center", padding: "var(--space-12) var(--space-6)", gap: "var(--space-4)" }}
    >
      <div className="badge-icon">
        <IconWifiOff />
      </div>
      <div style={{ font: "600 20px/28px var(--font-sans)" }}>{title}</div>
      <p className="muted" style={{ margin: 0, maxWidth: "42ch" }}>
        Vérifie ta connexion, puis réessaie. Tes données sont en sécurité.
      </p>
      <Button onClick={onRetry}>Réessayer</Button>
    </div>
  );
}
