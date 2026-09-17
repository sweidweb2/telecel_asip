import { ROUTES } from "@/constants/routes";

/**
 * Map a staff pathname to the create route for that resource, if any.
 * List and detail/edit paths resolve to the same New destination.
 */
export function staffNewItemHref(pathname: string): string | null {
  const map: { prefix: string; href: string }[] = [
    { prefix: ROUTES.blogs, href: ROUTES.blogsNew },
    { prefix: ROUTES.portfolio, href: ROUTES.portfolioNew },
    { prefix: ROUTES.partners, href: ROUTES.partnersNew },
    { prefix: ROUTES.cohorts, href: ROUTES.cohortsNew },
    { prefix: ROUTES.events, href: ROUTES.eventsNew },
    { prefix: ROUTES.founderStories, href: ROUTES.founderStoriesNew },
    { prefix: ROUTES.evidence, href: ROUTES.evidenceNew },
    { prefix: ROUTES.impactMetrics, href: ROUTES.impactMetricsNew },
  ];

  for (const entry of map) {
    if (
      pathname === entry.prefix ||
      pathname.startsWith(`${entry.prefix}/`)
    ) {
      return entry.href;
    }
  }
  return null;
}

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest("[contenteditable='true']"));
}
