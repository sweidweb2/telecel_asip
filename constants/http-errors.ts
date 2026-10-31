import type { LucideIcon } from "lucide-react";
import {
  CircleAlertIcon,
  FileQuestionIcon,
  LockIcon,
  ServerCrashIcon,
  WrenchIcon,
} from "lucide-react";

import type { Locale } from "@/constants/locales";

/** Dedicated public status routes (unlocalized). */
export const HTTP_ERROR_ROUTES = {
  forbidden: "/403",
  notFound: "/404",
  serverError: "/500",
  unavailable: "/503",
  generic: "/error",
} as const;

export type HttpErrorRoute =
  (typeof HTTP_ERROR_ROUTES)[keyof typeof HTTP_ERROR_ROUTES];

export type HttpErrorKind =
  | "403"
  | "404"
  | "500"
  | "503"
  | "generic";

export type HttpErrorCopy = {
  kind: HttpErrorKind;
  code: string;
  title: string;
  description: string;
  tone: "muted" | "destructive";
  icon: LucideIcon;
  documentTitle: string;
  tryAgain: string;
  goHome: string;
};

type HttpErrorLocaleCopy = Omit<HttpErrorCopy, "kind" | "code" | "tone" | "icon">;

const ICONS: Record<HttpErrorKind, LucideIcon> = {
  "403": LockIcon,
  "404": FileQuestionIcon,
  "500": ServerCrashIcon,
  "503": WrenchIcon,
  generic: CircleAlertIcon,
};

const TONES: Record<HttpErrorKind, HttpErrorCopy["tone"]> = {
  "403": "muted",
  "404": "muted",
  "500": "destructive",
  "503": "muted",
  generic: "destructive",
};

const CODES: Record<HttpErrorKind, string> = {
  "403": "403",
  "404": "404",
  "500": "500",
  "503": "503",
  generic: "Error",
};

const COPY: Record<Locale, Record<HttpErrorKind, HttpErrorLocaleCopy>> = {
  en: {
    "403": {
      title: "Access denied",
      description:
        "You do not have permission to view this page. Sign in with an allowed account, or go back home.",
      documentTitle: "Access denied",
      tryAgain: "Try again",
      goHome: "Go home",
    },
    "404": {
      title: "Page not found",
      description:
        "This page does not exist or was moved. Check the URL, or go back home.",
      documentTitle: "Page not found",
      tryAgain: "Try again",
      goHome: "Go home",
    },
    "500": {
      title: "Something went wrong",
      description:
        "An unexpected server error occurred. Try again in a moment, or go back home.",
      documentTitle: "Server error",
      tryAgain: "Try again",
      goHome: "Go home",
    },
    "503": {
      title: "Service unavailable",
      description:
        "ASIP is temporarily unavailable. We are working on it — try again shortly.",
      documentTitle: "Service unavailable",
      tryAgain: "Try again",
      goHome: "Go home",
    },
    generic: {
      title: "Something went wrong",
      description:
        "An unexpected error occurred. You can try again, or go back home.",
      documentTitle: "Error",
      tryAgain: "Try again",
      goHome: "Go home",
    },
  },
  fr: {
    "403": {
      title: "Accès refusé",
      description:
        "Vous n’avez pas l’autorisation de voir cette page. Connectez-vous avec un compte autorisé, ou retournez à l’accueil.",
      documentTitle: "Accès refusé",
      tryAgain: "Réessayer",
      goHome: "Retour à l’accueil",
    },
    "404": {
      title: "Page introuvable",
      description:
        "Cette page n’existe pas ou a été déplacée. Vérifiez l’URL, ou retournez à l’accueil.",
      documentTitle: "Page introuvable",
      tryAgain: "Réessayer",
      goHome: "Retour à l’accueil",
    },
    "500": {
      title: "Une erreur est survenue",
      description:
        "Une erreur serveur inattendue s’est produite. Réessayez dans un instant, ou retournez à l’accueil.",
      documentTitle: "Erreur serveur",
      tryAgain: "Réessayer",
      goHome: "Retour à l’accueil",
    },
    "503": {
      title: "Service indisponible",
      description:
        "ASIP est temporairement indisponible. Nous y travaillons — réessayez sous peu.",
      documentTitle: "Service indisponible",
      tryAgain: "Réessayer",
      goHome: "Retour à l’accueil",
    },
    generic: {
      title: "Une erreur est survenue",
      description:
        "Une erreur inattendue s’est produite. Vous pouvez réessayer, ou retourner à l’accueil.",
      documentTitle: "Erreur",
      tryAgain: "Réessayer",
      goHome: "Retour à l’accueil",
    },
  },
};

/** Pathnames that host status UI — do not redirect away from these. */
export const HTTP_ERROR_PATHNAMES: ReadonlySet<string> = new Set(
  Object.values(HTTP_ERROR_ROUTES),
);

export function httpErrorCopyFor(
  kind: HttpErrorKind,
  locale: Locale = "en",
): HttpErrorCopy {
  const copy = COPY[locale][kind];
  return {
    kind,
    code: CODES[kind],
    tone: TONES[kind],
    icon: ICONS[kind],
    ...copy,
  };
}

/** Map a numeric / string code to a kind; unknown codes use generic. */
export function httpErrorKindFromCode(
  code: string | number | null | undefined,
): HttpErrorKind {
  const normalized = String(code ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "403") return "403";
  if (normalized === "404") return "404";
  if (normalized === "500") return "500";
  if (normalized === "503") return "503";
  return "generic";
}

export function httpErrorPathFor(kind: HttpErrorKind): HttpErrorRoute {
  switch (kind) {
    case "403":
      return HTTP_ERROR_ROUTES.forbidden;
    case "404":
      return HTTP_ERROR_ROUTES.notFound;
    case "500":
      return HTTP_ERROR_ROUTES.serverError;
    case "503":
      return HTTP_ERROR_ROUTES.unavailable;
    default:
      return HTTP_ERROR_ROUTES.generic;
  }
}

/** Dedicated status kinds that share one dynamic route. */
export const HTTP_STATUS_CODES = ["403", "404", "500", "503"] as const;

export type HttpStatusCode = (typeof HTTP_STATUS_CODES)[number];

export function isHttpStatusCode(value: string): value is HttpStatusCode {
  return (HTTP_STATUS_CODES as readonly string[]).includes(value);
}

/** Build `/500?digest=…` (or another status path) for client navigation. */
export function httpErrorHref(
  kind: HttpErrorKind,
  options?: { digest?: string; code?: string },
): string {
  const path = httpErrorPathFor(kind);
  const params = new URLSearchParams();
  if (options?.digest) params.set("digest", options.digest);
  if (kind === "generic" && options?.code) params.set("code", options.code);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
