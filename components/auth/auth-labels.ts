import type { Locale } from "@/constants/locales";

export type LoginLabels = {
  title: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  submitLabel: string;
  submittingLabel: string;
  noAccountPrompt: string;
  signUpLink: string;
  successToast: string;
};

export type SignupLabels = {
  title: string;
  description: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  submitLabel: string;
  submittingLabel: string;
  hasAccountPrompt: string;
  loginLink: string;
  developerNote: string;
  successToast: string;
};

export type AuthActionMessages = {
  invalidCredentials: string;
  emailExists: string;
  weakPassword: string;
  emailNotConfirmed: string;
  rateLimited: string;
  genericError: string;
  invalidSignupDetails: string;
  invalidLoginDetails: string;
  accountCreated: string;
  confirmEmail: string;
  signedIn: string;
};

const LOGIN: Record<Locale, LoginLabels> = {
  en: {
    title: "Login",
    description: "Enter your email and password to continue.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    showPassword: "Show password",
    hidePassword: "Hide password",
    submitLabel: "Sign in",
    submittingLabel: "Signing in…",
    noAccountPrompt: "No account?",
    signUpLink: "Sign up",
    successToast: "Signed in.",
  },
  fr: {
    title: "Connexion",
    description: "Entrez votre e-mail et votre mot de passe pour continuer.",
    emailLabel: "E-mail",
    emailPlaceholder: "vous@exemple.com",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "••••••••",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
    submitLabel: "Se connecter",
    submittingLabel: "Connexion…",
    noAccountPrompt: "Pas de compte ?",
    signUpLink: "S’inscrire",
    successToast: "Connecté.",
  },
};

const SIGNUP: Record<Locale, SignupLabels> = {
  en: {
    title: "Sign up",
    description: "Create a developer admin account to access the dashboard.",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm password",
    submitLabel: "Create account",
    submittingLabel: "Creating account…",
    hasAccountPrompt: "Already have an account?",
    loginLink: "Login",
    developerNote:
      "Developer testing only — new accounts receive the admin role.",
    successToast: "Account created.",
  },
  fr: {
    title: "Inscription",
    description:
      "Créez un compte admin développeur pour accéder au tableau de bord.",
    nameLabel: "Nom",
    namePlaceholder: "Votre nom",
    emailLabel: "E-mail",
    emailPlaceholder: "vous@exemple.com",
    passwordLabel: "Mot de passe",
    confirmPasswordLabel: "Confirmer le mot de passe",
    submitLabel: "Créer un compte",
    submittingLabel: "Création…",
    hasAccountPrompt: "Déjà un compte ?",
    loginLink: "Connexion",
    developerNote:
      "Réservé aux tests développeur — les nouveaux comptes reçoivent le rôle admin.",
    successToast: "Compte créé.",
  },
};

const ACTION_MESSAGES: Record<Locale, AuthActionMessages> = {
  en: {
    invalidCredentials: "Invalid email or password.",
    emailExists: "An account with this email already exists.",
    weakPassword:
      "Password is too weak. Use at least 8 characters with a letter and a number.",
    emailNotConfirmed: "Confirm your email before signing in.",
    rateLimited: "Too many attempts. Please wait a moment and try again.",
    genericError: "Something went wrong. Please try again.",
    invalidSignupDetails: "Invalid signup details.",
    invalidLoginDetails: "Invalid login details.",
    accountCreated: "Account created.",
    confirmEmail: "Check your email to confirm your account, then sign in.",
    signedIn: "Signed in.",
  },
  fr: {
    invalidCredentials: "E-mail ou mot de passe invalide.",
    emailExists: "Un compte avec cet e-mail existe déjà.",
    weakPassword:
      "Mot de passe trop faible. Utilisez au moins 8 caractères avec une lettre et un chiffre.",
    emailNotConfirmed: "Confirmez votre e-mail avant de vous connecter.",
    rateLimited: "Trop de tentatives. Patientez un instant puis réessayez.",
    genericError: "Une erreur s’est produite. Réessayez.",
    invalidSignupDetails: "Informations d’inscription invalides.",
    invalidLoginDetails: "Informations de connexion invalides.",
    accountCreated: "Compte créé.",
    confirmEmail:
      "Vérifiez votre e-mail pour confirmer votre compte, puis connectez-vous.",
    signedIn: "Connecté.",
  },
};

export function loginLabelsFor(locale: Locale): LoginLabels {
  return LOGIN[locale];
}

export function signupLabelsFor(locale: Locale): SignupLabels {
  return SIGNUP[locale];
}

export function authActionMessagesFor(locale: Locale): AuthActionMessages {
  return ACTION_MESSAGES[locale];
}
