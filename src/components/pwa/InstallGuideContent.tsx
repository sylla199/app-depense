import { Button } from "@/components/ui/Button";

interface InstallGuideContentProps {
  /** Présent sur Android/Chrome : déclenche l'invite native en un geste. */
  onInstallClick?: () => void;
}

/**
 * Guide pas à pas (section "Installer : installation et import" du
 * handoff) : Android avec Chrome (bouton natif si disponible, sinon étapes
 * de menu), iPhone avec Safari (aucune invitation native n'existe côté
 * iOS — uniquement le guide).
 */
export function InstallGuideContent({ onInstallClick }: InstallGuideContentProps) {
  return (
    <div className="stack" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {onInstallClick ? (
        <Button block onClick={onInstallClick}>
          Installer maintenant
        </Button>
      ) : null}

      <div>
        <p className="label" style={{ marginBottom: 8 }}>
          Android (Chrome)
        </p>
        <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
          <li>Ouvre le menu ⋮ en haut à droite de Chrome.</li>
          <li>Touche « Installer l&apos;application » ou « Ajouter à l&apos;écran d&apos;accueil ».</li>
          <li>Confirme : l&apos;icône apparaît sur ton écran d&apos;accueil.</li>
        </ol>
      </div>

      <div>
        <p className="label" style={{ marginBottom: 8 }}>
          iPhone (Safari)
        </p>
        <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
          <li>
            Touche l&apos;icône Partager <span aria-hidden="true">⬆</span> en bas de l&apos;écran.
          </li>
          <li>
            Fais défiler et touche <strong>Sur l&apos;écran d&apos;accueil</strong>.
          </li>
          <li>Touche « Ajouter » en haut à droite.</li>
        </ol>
      </div>

      <p className="caption">
        Une fois installée, l&apos;application s&apos;ouvre en plein écran, comme une application
        native.
      </p>
    </div>
  );
}
