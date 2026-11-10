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
  forgotPasswordLink: string;
  forgotPasswordTitle: string;
  forgotPasswordBody: string;
  forgotPasswordEmailLabel: string;
  forgotPasswordClose: string;
  submitLabel: string;
  submittingLabel: string;
  noAccountPrompt: string;
  signUpLink: string;
  successToast: string;
  turnstileHint: string;
  googleLabel: string;
  googleLoadingLabel: string;
  dividerLabel: string;
  googleError: string;
};

export type SignupLabels = {
  title: string;
  description: string;
  accountTypeLabel: string;
  startupLabel: string;
  investorLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  submitLabel: string;
  submittingLabel: string;
  hasAccountPrompt: string;
  loginLink: string;
  viewerNote: string;
  successToast: string;
  turnstileHint: string;
  googleLabel: string;
  googleLoadingLabel: string;
  dividerLabel: string;
  googleError: string;
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
  verificationFailed: string;
};

const LOGIN: Record<Locale, LoginLabels> = {
  en: {
    title: "Login",
    description: "Enter your email and password to continue.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    forgotPasswordLink: "Forgot password?",
    forgotPasswordTitle: "Reset password",
    forgotPasswordBody:
      "There is no self-serve password reset. Email the ASIP team and they will help you regain access.",
    forgotPasswordEmailLabel: "Contact email",
    forgotPasswordClose: "Close",
    submitLabel: "Sign in",
    submittingLabel: "Signing in…",
    noAccountPrompt: "No account?",
    signUpLink: "Sign up",
    successToast: "Signed in.",
    turnstileHint: "Complete the security check before signing in.",
    googleLabel: "Continue with Google",
    googleLoadingLabel: "Redirecting…",
    dividerLabel: "or continue with email",
    googleError: "Could not start Google sign-in. Please try again.",
  },
  fr: {
    title: "Connexion",
    description: "Entrez votre e-mail et votre mot de passe pour continuer.",
    emailLabel: "E-mail",
    emailPlaceholder: "vous@exemple.com",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "Entrez votre mot de passe",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
    forgotPasswordLink: "Mot de passe oublié ?",
    forgotPasswordTitle: "Réinitialiser le mot de passe",
    forgotPasswordBody:
      "Il n’y a pas de réinitialisation en libre-service. Écrivez à l’équipe ASIP pour récupérer l’accès.",
    forgotPasswordEmailLabel: "E-mail de contact",
    forgotPasswordClose: "Fermer",
    submitLabel: "Se connecter",
    submittingLabel: "Connexion…",
    noAccountPrompt: "Pas de compte ?",
    signUpLink: "S’inscrire",
    successToast: "Connecté.",
    turnstileHint: "Complétez la vérification de sécurité avant de vous connecter.",
    googleLabel: "Continuer avec Google",
    googleLoadingLabel: "Redirection…",
    dividerLabel: "ou continuer avec l’e-mail",
    googleError: "Impossible de lancer la connexion Google. Réessayez.",
  },
};

const SIGNUP: Record<Locale, SignupLabels> = {
  en: {
    title: "Sign up",
    description:
      "Create an account to register interest or apply to ASIP.",
    accountTypeLabel: "I am a",
    startupLabel: "Startup",
    investorLabel: "Investor",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    confirmPasswordLabel: "Confirm password",
    submitLabel: "Create account",
    submittingLabel: "Creating account…",
    hasAccountPrompt: "Already have an account?",
    loginLink: "Login",
    viewerNote:
      "New accounts are viewers. They can use intake forms, not the Editor or Admin panels.",
    successToast: "Account created.",
    turnstileHint: "Complete the security check before creating your account.",
    googleLabel: "Sign up with Google",
    googleLoadingLabel: "Redirecting…",
    dividerLabel: "or sign up with email",
    googleError: "Could not start Google sign-up. Please try again.",
  },
  fr: {
    title: "Inscription",
    description:
      "Créez un compte pour manifester votre intérêt ou candidater à ASIP.",
    accountTypeLabel: "Je suis",
    startupLabel: "Startup",
    investorLabel: "Investisseur",
    nameLabel: "Nom",
    namePlaceholder: "Votre nom",
    emailLabel: "E-mail",
    emailPlaceholder: "vous@exemple.com",
    passwordLabel: "Mot de passe",
    passwordPlaceholder: "Entrez votre mot de passe",
    confirmPasswordLabel: "Confirmer le mot de passe",
    submitLabel: "Créer un compte",
    submittingLabel: "Création…",
    hasAccountPrompt: "Déjà un compte ?",
    loginLink: "Connexion",
    viewerNote:
      "Les nouveaux comptes sont des viewers. Ils peuvent utiliser les formulaires d’admission, pas le tableau de bord admin.",
    successToast: "Compte créé.",
    turnstileHint:
      "Complétez la vérification de sécurité avant de créer votre compte.",
    googleLabel: "S’inscrire avec Google",
    googleLoadingLabel: "Redirection…",
    dividerLabel: "ou s’inscrire avec l’e-mail",
    googleError: "Impossible de lancer l’inscription Google. Réessayez.",
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
    verificationFailed: "Security check failed. Please try again.",
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
    verificationFailed:
      "La vérification de sécurité a échoué. Veuillez réessayer.",
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
