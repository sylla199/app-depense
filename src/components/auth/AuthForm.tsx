"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { IconCheck, IconEye, IconEyeOff } from "@/components/ui/Icons";

type Mode = "connexion" | "inscription";

/**
 * Inscription et connexion — fidèle à `Inscription.dc.html` : mise en page
 * à deux colonnes (bandeau sombre décoratif à gauche avec accroche et
 * réassurance, formulaire à droite), masquée sous 900 px (le formulaire
 * occupe alors toute la largeur).
 */
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

  return (
    <div className="grid grid-cols-1 min-[900px]:grid-cols-2" style={{ minHeight: "100vh" }}>
      <aside
        className="hidden min-[900px]:flex"
        style={{
          margin: "var(--space-6)",
          borderRadius: "var(--radius-xl)",
          background: "var(--band-deep)",
          color: "var(--on-band)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: "var(--space-6)",
          padding: "var(--space-12)",
        }}
      >
        <h2 style={{ margin: 0, font: "600 40px/44px var(--font-display)", letterSpacing: "-1px", maxWidth: "14ch" }}>
          Répartis. Épargne. Planifie.
        </h2>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <li style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <IconCheck />
            Aucune connexion bancaire
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <IconCheck />
            Export et suppression de tes données à tout moment
          </li>
        </ul>
      </aside>

      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-12) var(--space-6)" }}>
        <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <div className="topnav-brand">
            <Image src="/icons/icon-48.png" alt="" width={32} height={32} />
            Dépenses
          </div>

          <div className="pill-nav" role="group" aria-label="Choisir une action" style={{ alignSelf: "flex-start" }}>
            <button type="button" aria-pressed={mode === "inscription"} onClick={() => setMode("inscription")}>
              Créer mon espace
            </button>
            <button type="button" aria-pressed={mode === "connexion"} onClick={() => setMode("connexion")}>
              Se connecter
            </button>
          </div>

          <h1 className="screen-title" style={{ margin: 0, fontSize: 24, lineHeight: "32px" }}>
            {mode === "inscription" ? "Crée ton espace" : "Content de te revoir"}
          </h1>

          <form className="stack" style={{ gap: "var(--space-4)" }} onSubmit={onSubmit}>
            {errors._global ? (
              <div className="card" role="alert" style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start", boxShadow: "inset 0 0 0 2px var(--over)" }}>
                <svg className="ico" viewBox="0 0 24 24" aria-hidden="true" style={{ color: "var(--over)" }}>
                  <path d="M12 8v5M12 16.5v.01" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <div className="row-main">
                  <div className="row-title" style={{ whiteSpace: "normal" }}>
                    E-mail ou mot de passe incorrect
                  </div>
                  <div className="row-sub">
                    Vérifie tes informations, ou{" "}
                    <a className="link" href="/mot-de-passe-oublie">
                      réinitialise ton mot de passe
                    </a>
                    .
                  </div>
                </div>
              </div>
            ) : null}

            <div className="field-box">
              <label className="label" htmlFor="email">
                Adresse e-mail
              </label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="prenom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? "true" : undefined}
                aria-describedby="email-err"
                required
              />
              {errors.email ? (
                <div id="email-err" className="field-error" role="alert">
                  {errors.email}
                </div>
              ) : null}
            </div>

            <div className="field-box">
              <label className="label" htmlFor="pwd">
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="pwd"
                  className="input"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "inscription" ? "new-password" : "current-password"}
                  placeholder="Ton mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={errors.password ? "true" : undefined}
                  aria-describedby="pwd-err"
                  style={{ paddingRight: 56 }}
                  required
                />
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ position: "absolute", right: 4, top: 4, width: 44, height: 44, background: "transparent", color: "var(--ink-muted)" }}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.password ? (
                <div id="pwd-err" className="field-error" role="alert">
                  {errors.password}
                </div>
              ) : null}
            </div>

            {mode === "inscription" ? (
              <>
                <div className="wrap" style={{ flexWrap: "nowrap", alignItems: "flex-start", gap: "var(--space-3)" }}>
                  <button
                    type="button"
                    className="check"
                    role="checkbox"
                    aria-checked={consent}
                    aria-labelledby="consent-text"
                    onClick={() => setConsent((v) => !v)}
                  >
                    <IconCheck />
                  </button>
                  <span id="consent-text" className="caption" style={{ color: "var(--ink)" }}>
                    J&apos;accepte la{" "}
                    <a className="link" href="/confidentialite#conditions">
                      politique de confidentialité
                    </a>
                    . Mes données restent les miennes.
                  </span>
                </div>
                <Button type="submit" block disabled={!consent || submitting}>
                  {submitting ? "…" : "Créer mon espace"}
                </Button>
                {!consent ? (
                  <div className="caption" role="status">
                    Coche la case ci-dessus pour créer ton espace.
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <a
                  className="link"
                  href="/mot-de-passe-oublie"
                  style={{ alignSelf: "flex-start", minHeight: 44, display: "inline-flex", alignItems: "center" }}
                >
                  Mot de passe oublié ?
                </a>
                <Button type="submit" block disabled={submitting}>
                  {submitting ? "…" : "Se connecter"}
                </Button>
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
