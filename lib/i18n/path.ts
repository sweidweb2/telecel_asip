import { isLocale, type Locale } from "@/constants/locales";

/**
 * Swap the leading locale segment in a pathname.
 * `/en/portfolio` + `fr` → `/fr/portfolio`; `/en` + `fr` → `/fr`.
 */
export function swapLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return `/${nextLocale}`;
  }

  if (isLocale(segments[0])) {
    segments[0] = nextLocale;
  } else {
    segments.unshift(nextLocale);
  }

  return `/${segments.join("/")}`;
}

/** Path without leading locale, e.g. `/en/about` → `/about`, `/fr` → `/`. */
export function stripLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return "/";
  }
  if (isLocale(segments[0])) {
    segments.shift();
  }
  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const first = pathname.split("/").filter(Boolean)[0];
  return first && isLocale(first) ? first : null;
}
