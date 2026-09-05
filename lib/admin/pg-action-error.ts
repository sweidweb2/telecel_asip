export type PgActionError = {
  code?: string;
  message?: string;
};

export type PgActionErrorMessages = {
  unauthorized: string;
  notFound: string;
  genericError: string;
  /** Used for FK violations on write (e.g. invalid owner). */
  foreignKeyWrite?: string;
  /** Used for FK restrict on delete (e.g. evidence still linked). */
  foreignKeyDelete?: string;
  /** Used for unique violations when `uniqueConstraint` matches. */
  uniqueViolation?: string;
  /** Substring(s) in the error message that mark a unique conflict. */
  uniqueConstraint?: string | string[];
};

export type PgActionErrorContext = "write" | "delete";

/**
 * Map common Postgres / PostgREST codes to admin action error copy.
 * Entity-specific FK / unique strings are optional overrides.
 */
export function mapPgActionError(
  error: PgActionError,
  messages: PgActionErrorMessages,
  context: PgActionErrorContext = "write",
): string {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (code === "42501" || message.includes("not authorized")) {
    return messages.unauthorized;
  }

  if (
    code === "PGRST116" ||
    code === "P0002" ||
    message.includes("no rows") ||
    message.includes("not found") ||
    message.includes("no data")
  ) {
    return messages.notFound;
  }

  if (code === "23505" || message.includes("duplicate")) {
    if (messages.uniqueViolation) {
      const needles = messages.uniqueConstraint;
      if (!needles) return messages.uniqueViolation;
      const list = Array.isArray(needles) ? needles : [needles];
      if (list.some((n) => message.includes(n.toLowerCase()))) {
        return messages.uniqueViolation;
      }
      if (code === "23505") return messages.uniqueViolation;
    }
  }

  if (code === "23503" || message.includes("foreign key")) {
    if (context === "delete" && messages.foreignKeyDelete) {
      return messages.foreignKeyDelete;
    }
    if (messages.foreignKeyWrite) {
      return messages.foreignKeyWrite;
    }
  }

  return messages.genericError;
}
