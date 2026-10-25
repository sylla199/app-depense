import type { InputHTMLAttributes } from "react";
import { useId } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  amount?: boolean;
}

/**
 * Champ labellisé avec erreur inline (icône "!" + texte, jamais la couleur
 * seule), `aria-invalid` + `aria-describedby` vers le message, selon la
 * section "Formulaires en erreur" / "Rôles et libellés" du handoff.
 */
export function Field({ label, error, amount = false, id, className = "", ...props }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className="field-box">
      <label htmlFor={inputId} className="label">
        {label}
      </label>
      <input
        id={inputId}
        className={["input", amount ? "input-amount" : "", className].filter(Boolean).join(" ")}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="field-error">
          <span aria-hidden="true">!</span> {error}
        </p>
      ) : null}
    </div>
  );
}
