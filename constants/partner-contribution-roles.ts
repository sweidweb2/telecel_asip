import roles from "@/constants/partner-contribution-roles.json";

/** Suggested Role / Contribution labels for the partner editor typeahead. */
export const PARTNER_CONTRIBUTION_ROLES = roles as readonly string[];

export const PARTNER_CONTRIBUTION_SUGGESTION_LIMIT = 5;

/**
 * Current token being typed: text after the last space.
 * A trailing space means a new value has started (empty token).
 */
export function getPartnerContributionActiveWord(value: string): string {
  const lastSpace = value.lastIndexOf(" ");
  if (lastSpace === -1) return value;
  return value.slice(lastSpace + 1);
}

/**
 * Replace the active (last) word with a chosen suggestion.
 * Keeps any completed words before the last space.
 */
export function applyPartnerContributionSuggestion(
  value: string,
  suggestion: string,
): string {
  const lastSpace = value.lastIndexOf(" ");
  if (lastSpace === -1) return suggestion;
  const prefix = value.slice(0, lastSpace).trimEnd();
  return prefix ? `${prefix} ${suggestion}` : suggestion;
}

/**
 * Filter role suggestions by the active word only (after the last space).
 * Empty active word returns the first N entries as browse hints.
 */
export function filterPartnerContributionRoles(
  value: string,
  limit = PARTNER_CONTRIBUTION_SUGGESTION_LIMIT,
): string[] {
  const q = getPartnerContributionActiveWord(value).trim().toLowerCase();
  const matched = q
    ? PARTNER_CONTRIBUTION_ROLES.filter((role) =>
        role.toLowerCase().includes(q),
      )
    : [...PARTNER_CONTRIBUTION_ROLES];
  return matched.slice(0, limit);
}
