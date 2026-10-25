import { Button } from "@/components/ui/Button";

interface ErrorCardProps {
  title: string;
  onRetry: () => void;
}

/** Carte d'erreur de chargement (section "États"). `role="alert"`. */
export function ErrorCard({ title, onRetry }: ErrorCardProps) {
  return (
    <div className="card" role="alert" style={{ textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
      <p aria-hidden="true" style={{ fontSize: 32 }}>
        📡
      </p>
      <p className="t-md" style={{ margin: "0 0 8px" }}>
        {title}
      </p>
      <p className="caption" style={{ margin: "0 0 16px" }}>
        Vérifie ta connexion, puis réessaie. Tes données sont en sécurité.
      </p>
      <Button variant="secondary" onClick={onRetry}>
        Réessayer
      </Button>
    </div>
  );
}
