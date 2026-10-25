"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconCheck, IconEye, IconEyeOff } from "@/components/ui/Icons";
import { isEmailValid } from "@/lib/validators";

type Step = 1 | 2 | 3 | 4;

/**
 * Mot de passe oublié — fidèle à `MotDePasse.dc.html`. La source elle-même
 * présente ce parcours comme une « maquette » (le bouton de l'étape 2 le dit
 * explicitement) : aucun fournisseur d'envoi d'e-mail n'est branché dans ce
 * jalon, donc ce composant rejoue le même flux visuel à 4 étapes sans
 * modifier réellement un mot de passe — le libellé "(maquette)" est
 * conservé pour ne jamais laisser croire à une vraie réinitialisation.
 */
export function MotDePasseWizard() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [show, setShow] = useState(false);
  const [tried, setTried] = useState(false);

  const r1 = pwd.length >= 8;
  const r2 = /\d/.test(pwd);
  const mismatch = tried && pwd !== pwd2;

  function send() {
    if (isEmailValid(email)) {
      setStep(2);
    } else {
      setEmailErr(true);
    }
  }

  function save() {
    if (pwd === pwd2 && r1 && r2) {
      setStep(4);
    } else {
      setTried(true);
    }
  }

  return (
    <div className="pw">
      <div className="pw-card">
        <div className="topnav-brand">
          <Image src="/icons/icon-48.png" alt="" width={32} height={32} />
          Dépenses
        </div>
        <div className="step-dots" role="img" aria-label={`Étape ${step} sur 4`}>
          <span className="on" />
          <span className={step >= 2 ? "on" : ""} />
          <span className={step >= 3 ? "on" : ""} />
          <span className={step >= 4 ? "on" : ""} />
        </div>

        {step === 1 ? (
          <form className="stack" style={{ gap: "var(--space-4)" }} onSubmit={(e) => e.preventDefault()}>
            <h1 className="screen-title" style={{ margin: 0, fontSize: 24, lineHeight: "32px" }}>
              Mot de passe oublié ?
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              Saisis ton adresse e-mail. On t&apos;envoie un lien pour choisir un nouveau mot de
              passe.
            </p>
            <div className="field-box">
              <label className="label" htmlFor="fe">
                Adresse e-mail
              </label>
              <input
                id="fe"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="prenom@exemple.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailErr(false);
                }}
                aria-invalid={emailErr ? "true" : undefined}
                aria-describedby="fe-err"
              />
              {emailErr ? (
                <div id="fe-err" className="field-error" role="alert">
                  Cette adresse e-mail n&apos;est pas valide. Exemple : prenom@exemple.com
                </div>
              ) : null}
            </div>
            <Button block type="button" onClick={send}>
              Envoyer le lien
            </Button>
            <Link href="/connexion" className="link" style={{ minHeight: 44, display: "inline-flex", alignItems: "center", alignSelf: "flex-start" }}>
              Retour à la connexion
            </Link>
          </form>
        ) : null}

        {step === 2 ? (
          <div className="stack" style={{ gap: "var(--space-4)" }}>
            <div className="badge-icon">
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </div>
            <h1 className="screen-title" style={{ margin: 0, fontSize: 24, lineHeight: "32px" }}>
              Regarde tes e-mails
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              Si un compte existe pour <strong style={{ color: "var(--ink)" }}>{email || "prenom@exemple.com"}</strong>, tu reçois
              un lien valable 30 minutes. Pense à vérifier tes courriers indésirables.
            </p>
            <Button block type="button" onClick={() => setStep(3)}>
              J&apos;ai ouvert le lien (maquette)
            </Button>
            <Button block variant="secondary" type="button" disabled>
              Renvoyer le lien
            </Button>
            <div className="caption" role="status">
              Tu pourras renvoyer le lien dans 30 secondes.
            </div>
            <button
              type="button"
              className="link"
              onClick={() => setStep(1)}
              style={{ minHeight: 44, border: 0, background: "transparent", cursor: "pointer", textAlign: "left", alignSelf: "flex-start" }}
            >
              Changer d&apos;adresse
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <form className="stack" style={{ gap: "var(--space-4)" }} onSubmit={(e) => e.preventDefault()}>
            <h1 className="screen-title" style={{ margin: 0, fontSize: 24, lineHeight: "32px" }}>
              Choisis un nouveau mot de passe
            </h1>
            <div className="field-box">
              <label className="label" htmlFor="np1">
                Nouveau mot de passe
              </label>
              <div className="pw-wrap">
                <input
                  id="np1"
                  className="input"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                />
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  onClick={() => setShow((v) => !v)}
                >
                  {show ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>
            <div className="stack" style={{ gap: "var(--space-1)" }} aria-live="polite">
              <div className={`rule ${r1 ? "ok" : ""}`}>
                <span className="tick">
                  <IconCheck />
                </span>
                8 caractères minimum
              </div>
              <div className={`rule ${r2 ? "ok" : ""}`}>
                <span className="tick">
                  <IconCheck />
                </span>
                Au moins un chiffre
              </div>
            </div>
            <div className="field-box">
              <label className="label" htmlFor="np2">
                Confirme le mot de passe
              </label>
              <input
                id="np2"
                className="input"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                aria-invalid={mismatch ? "true" : undefined}
              />
              {mismatch ? (
                <div className="field-error" role="alert">
                  Les deux mots de passe ne sont pas identiques.
                </div>
              ) : null}
            </div>
            <Button block type="button" onClick={save}>
              Enregistrer
            </Button>
          </form>
        ) : null}

        {step === 4 ? (
          <div className="stack" style={{ gap: "var(--space-4)" }}>
            <div className="celebrate" role="status">
              <div className="celebrate-icon">
                <IconCheck />
              </div>
              <div className="row-main">
                <div className="celebrate-title">Mot de passe mis à jour</div>
                <div className="row-sub">Tu peux te reconnecter avec ton nouveau mot de passe.</div>
              </div>
            </div>
            <Link href="/connexion" className="btn btn-primary btn-block">
              Me connecter
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
