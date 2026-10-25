/**
 * Icônes — tracés SVG copiés tels quels du canvas de design v9 (le handoff
 * les décrit comme "provisoires, à remplacer par Hugeicons", mais ce sont
 * ceux que Sylla a vus et validés en attendant : on les reprend à
 * l'identique plutôt que d'en inventer d'autres). `className="ico"` par
 * défaut (22×22, trait 1,5, voir components.css) ; passe `className` pour
 * une autre taille (ex. dans `.row-icon`, `.badge-icon`, un bouton `.btn`).
 */
import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps, children: ReactNode) {
  const { className = "ico", ...rest } = props;
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export const IconMois = (p: IconProps) => base(p, <path d="M3 11l9-7 9 7M5 10v10h14V10" />);
export const IconHistorique = (p: IconProps) =>
  base(p, <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" />);
export const IconEpargne = (p: IconProps) =>
  base(p, <path d="M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7l2-3h12M16 14h2" />);
export const IconProjets = (p: IconProps) =>
  base(
    p,
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  );
export const IconSimulation = (p: IconProps) => base(p, <path d="M5 20V11M12 20V5M19 20v-7" />);
export const IconRappels = (p: IconProps) =>
  base(p, <path d="M6 17V11a6 6 0 0112 0v6l2 2H4zM10 21h4" />);
export const IconReglages = (p: IconProps) =>
  base(
    p,
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </>
  );

export const IconPlus = (p: IconProps) => base(p, <path d="M12 5v14M5 12h14" />);
export const IconShare = (p: IconProps) => base(p, <path d="M12 4v11M8 8l4-4 4 4M5 14v6h14v-6" />);
export const IconChevronLeft = (p: IconProps) => base(p, <path d="M14 6l-6 6 6 6" />);
export const IconChevronDown = (p: IconProps) => base(p, <path d="M6 9l6 6 6-6" />);
export const IconClose = (p: IconProps) => base(p, <path d="M6 6l12 12M18 6L6 18" />);
export const IconCheck = (p: IconProps) => base(p, <path d="M5 12.5l4.5 4.5L19 7.5" />);
export const IconRecurring = (p: IconProps) =>
  base(p, <path d="M17 3l3 3-3 3M20 6H8a4 4 0 00-4 4M7 21l-3-3 3-3M4 18h12a4 4 0 004-4" />);
export const IconEdit = (p: IconProps) => base(p, <path d="M4 20l4-1 11-11-3-3L5 16zM14 7l3 3" />);
export const IconTrash = (p: IconProps) =>
  base(p, <path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v6M14 11v6" />);
export const IconWifiOff = (p: IconProps) =>
  base(p, <path d="M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M4 4l16 16" />);
export const IconAlert = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M12 8v5M12 16.5v.01" />
      <circle cx="12" cy="12" r="9" />
    </>
  );
export const IconClock = (p: IconProps) =>
  base(
    p,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  );
export const IconEye = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  );
export const IconEyeOff = (p: IconProps) =>
  base(
    p,
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M4 4l16 16" />
    </>
  );

/* Icônes de catégorie (celles vues sur le Mois/la Catégorie) */
export const IconCatFixed = IconMois; // toit de maison, réutilisé pour "Achats fixes"
export const IconCatSavings = IconEpargne;
export const IconCatFamily = (p: IconProps) =>
  base(
    p,
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.2a3 3 0 010 5.6M18 14.4c1.8.8 3 2.6 3 4.6" />
    </>
  );
export const IconCatPocket = (p: IconProps) =>
  base(p, <path d="M3 4h2l2 12h11l2-8H6M9 20v.01M17 20v.01" />);
export const IconCatProject = IconProjets;

/**
 * Un seul composant plutôt qu'une fonction qui renvoie une référence de
 * composant : React (le compilateur/eslint-plugin-react-hooks) déconseille
 * de stocker un composant dans une variable puis de l'invoquer en JSX
 * (`const Icon = pick(); <Icon/>`), car il ne peut pas garantir une
 * référence stable d'un rendu à l'autre.
 */
export function CategoryIcon({ kind, className }: { kind: string; className?: string }) {
  switch (kind) {
    case "SAVINGS":
      return <IconCatSavings className={className} />;
    case "FAMILY":
      return <IconCatFamily className={className} />;
    case "POCKET":
      return <IconCatPocket className={className} />;
    case "FIXED":
      return <IconCatFixed className={className} />;
    default:
      return <IconCatProject className={className} />;
  }
}
