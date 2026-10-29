import type { LucideIcon } from "lucide-react";
import {
  CircleAlertIcon,
  FileQuestionIcon,
  LockIcon,
  ServerCrashIcon,
  WrenchIcon,
} from "lucide-react";

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
};

const COPY: Record<HttpErrorKind, HttpErrorCopy> = {
  "403": {
    kind: "403",
    code: "403",
    title: "Access denied",
    description:
      "You do not have permission to view this page. Sign in with an allowed account, or go back home.",
    tone: "muted",
    icon: LockIcon,
    documentTitle: "Access denied",
  },
  "404": {
    kind: "404",
    code: "404",
    title: "Page not found",
    description:
      "This page does not exist or was moved. Check the URL, or go back home.",
    tone: "muted",
    icon: FileQuestionIcon,
    documentTitle: "Page not found",
  },
  "500": {
    kind: "500",
    code: "500",
    title: "Something went wrong",
    description:
      "An unexpected server error occurred. Try again in a moment, or go back home.",
    tone: "destructive",
    icon: ServerCrashIcon,
    documentTitle: "Server error",
  },
  "503": {
    kind: "503",
    code: "503",
    title: "Service unavailable",
    description:
      "ASIP is temporarily unavailable. We are working on it — try again shortly.",
    tone: "muted",
    icon: WrenchIcon,
    documentTitle: "Service unavailable",
  },
  generic: {
    kind: "generic",
    code: "Error",
    title: "Something went wrong",
    description:
      "An unexpected error occurred. You can try again, or go back home.",
    tone: "destructive",
    icon: CircleAlertIcon,
    documentTitle: "Error",
  },
};

/** Pathnames that host status UI — do not redirect away from these. */
export const HTTP_ERROR_PATHNAMES: ReadonlySet<string> = new Set(
  Object.values(HTTP_ERROR_ROUTES),
);

export function httpErrorCopyFor(kind: HttpErrorKind): HttpErrorCopy {
  return COPY[kind];
}

/** Map a numeric / string code to a kind; unknown codes use generic. */
export function httpErrorKindFromCode(
  code: string | number | null | undefined,
): HttpErrorKind {
  const normalized = String(code ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "403" || normalized === "forbidden") return "403";
  if (normalized === "404" || normalized === "notfound" || normalized === "not-found")
    return "404";
  if (normalized === "500" || normalized === "server" || normalized === "internal")
    return "500";
  if (
    normalized === "503" ||
    normalized === "unavailable" ||
    normalized === "maintenance"
  )
    return "503";
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
