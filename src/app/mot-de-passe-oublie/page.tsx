import { ComingSoon } from "@/components/ui/ComingSoon";

export default function MotDePasseOubliePage() {
  return (
    <main id="contenu" style={{ padding: 16 }}>
      <ComingSoon
        title="Réinitialisation du mot de passe"
        description="Cette étape arrive dans un prochain jalon (l'envoi d'e-mails doit être branché sur un fournisseur). En attendant, contacte le porteur du projet pour réinitialiser ton mot de passe."
      />
    </main>
  );
}
