import { z } from "zod";
import { isEmailValid, isPasswordValid } from "@/lib/auth";

/** Messages d'erreur littéraux du handoff (section "Formulaires en erreur"). */
export const MESSAGES = {
  emailInvalide: "Cette adresse e-mail n'est pas valide. Exemple : prenom@exemple.com",
  motDePasseFaible: "Le mot de passe doit contenir au moins 8 caractères, dont un chiffre.",
  consentementRequis: "Coche la case ci-dessus pour créer ton espace.",
  identifiantsRefuses:
    "E-mail ou mot de passe incorrect. Vérifie tes informations, ou réinitialise ton mot de passe.",
  emailDejaUtilise: "Cette adresse e-mail est déjà utilisée.",
  montantInvalide: "Entre un montant supérieur à 0.",
  nomRequis: "Ce champ est obligatoire.",
} as const;

export const emailSchema = z
  .string()
  .trim()
  .refine(isEmailValid, { message: MESSAGES.emailInvalide });

export const passwordSchema = z
  .string()
  .refine(isPasswordValid, { message: MESSAGES.motDePasseFaible });

export const inscriptionSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  consent: z.literal(true, { message: MESSAGES.consentementRequis }),
});

export const connexionSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export const montantPositifSchema = z.number().int().gt(0, { message: MESSAGES.montantInvalide });
export const montantNonNegatifSchema = z.number().int().min(0);
export const nomSchema = z.string().trim().min(1, { message: MESSAGES.nomRequis });

export const sourceRevenuSchema = z.object({
  name: nomSchema,
  amount: montantPositifSchema,
  carryOver: z.boolean().default(true),
});

export const ligneCreateSchema = z.object({
  categoryId: z.string().min(1),
  name: nomSchema,
  planned: montantPositifSchema,
  actual: montantNonNegatifSchema.nullable().optional(),
  isFixed: z.boolean().default(false),
  countsInProjection: z.boolean().default(false),
});

export const ligneUpdateSchema = ligneCreateSchema.partial().extend({
  categoryId: z.string().min(1).optional(),
});

export const categorieCreateSchema = z.object({
  name: nomSchema,
  color: z.string().min(1),
});

export const categorieUpdateSchema = z.object({
  name: nomSchema.optional(),
  color: z.string().min(1).optional(),
});

export const categorieDeleteSchema = z.object({
  reassignToCategoryId: z.string().min(1).optional(),
});

export const premierLancementSchema = z.object({
  revenu: montantPositifSchema,
  premiereLigne: z.object({
    name: nomSchema,
    planned: montantPositifSchema,
    categoryId: z.string().min(1),
  }),
});
