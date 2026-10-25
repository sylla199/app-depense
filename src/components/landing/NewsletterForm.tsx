"use client";

import { useState } from "react";
import { isEmailValid } from "@/lib/validators";

/** Formulaire d'inscription à la newsletter du pied de page — fidèle à `Landing.dc.html`. */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="signup"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isEmailValid(email)) {
          setError("Cette adresse e-mail n'est pas valide. Exemple : prenom@exemple.com");
          return;
        }
        setError(null);
        setSent(true);
      }}
    >
      <label className="sr" htmlFor="mail">
        Adresse e-mail
      </label>
      <input
        id="mail"
        className="signup-input"
        type="email"
        placeholder="Saisis ton e-mail"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(null);
        }}
        aria-invalid={error ? "true" : undefined}
        disabled={sent}
      />
      <div className="signup-row">
        <span>{sent ? "Merci, à bientôt par e-mail." : "Reçois les nouveautés de Dépenses."}</span>
        {!sent ? (
          <button className="btn btn-sm" type="submit" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
            S&apos;inscrire
          </button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : null}
    </form>
  );
}
