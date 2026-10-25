"use client";

import { useState } from "react";
import { isEmailValid } from "@/lib/validators";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isEmailValid(email)) {
          setError("Cette adresse e-mail n'est pas valide. Exemple : prenom@exemple.com");
          return;
        }
        setError(null);
        setSent(true);
      }}
      style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
    >
      <label className="label" htmlFor="newsletter-email" style={{ width: "100%" }}>
        Nouveautés par e-mail
      </label>
      {sent ? (
        <p role="status" className="caption">
          Merci, à bientôt par e-mail.
        </p>
      ) : (
        <>
          <input
            id="newsletter-email"
            type="email"
            className="input"
            placeholder="toi@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? "true" : undefined}
            style={{ flex: 1, minWidth: 180 }}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            S&apos;inscrire
          </button>
        </>
      )}
      {error ? (
        <p role="alert" className="field-error" style={{ width: "100%" }}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
