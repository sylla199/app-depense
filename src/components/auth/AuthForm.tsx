"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

type Mode = "connexion" | "inscription";

export function AuthForm({ initialMode = "connexion" }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const endpoint = mode === "inscription" ? "/api/auth/inscription" : "/api/auth/connexion";
      const payload =
        mode === "inscription" ? { email, password, consent } : { email, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { _global: "Une erreur est survenue." });
        return;
      }
      router.push(mode === "inscription" ? "/premier-lancement" : data.redirectTo ?? "/mois");
    } finally {
      setSubmitting(false);
    }
  }

  const consentButtonLabel =
    mode === "inscription" && !consent
      ? "Coche la case ci-dessus pour créer ton espace."
      : mode === "inscription"
        ? "Créer mon espace"
        : "Se connecter";

  return (
    <div className="card card-lg" style={{ maxWidth: 420, margin: "64px auto" }}>
      <div className="pill-nav" style={{ marginBottom: 24 }} role="tablist" aria-label="Mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "connexion"}
          onClick={() => setMode("connexion")}
        >
          Se connecter
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "inscription"}
          onClick={() => setMode("inscription")}
        >
          Créer mon espace
        </button>
      </div>

      {errors._global ? (
        <p role="alert" className="field-error" style={{ marginBottom: 16 }}>
          <span aria-hidden="true">!</span> {errors._global}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="stack" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field
          label="E-mail"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />

        <div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Field
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "inscription" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Masquer" : "Afficher"}
            </Button>
          </div>
        </div>

        {mode === "inscription" ? (
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              role="checkbox"
              aria-checked={consent}
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              J&apos;accepte la{" "}
              <a href="/confidentialite#conditions" className="caption">
                politique de confidentialité
              </a>
              .
            </span>
          </label>
        ) : (
          <a href="/mot-de-passe-oublie" className="caption" style={{ color: "var(--accent)" }}>
            Mot de passe oublié ?
          </a>
        )}

        <Button type="submit" block disabled={submitting || (mode === "inscription" && !consent)}>
          {submitting ? "…" : consentButtonLabel}
        </Button>
      </form>
    </div>
  );
}
