import type { PgActionError } from "@/lib/admin/pg-action-error";

type LoggableError = PgActionError | Error | unknown;

function normalizeError(error: LoggableError): {
  code?: string;
  message?: string;
} {
  if (!error || typeof error !== "object") {
    return { message: String(error) };
  }

  const record = error as PgActionError & Error;
  return {
    code: typeof record.code === "string" ? record.code : undefined,
    message:
      typeof record.message === "string" ? record.message : String(error),
  };
}

/**
 * Server-only failure log for actions/API. Never pass emails, names, or
 * form bodies — keep payloads to codes, scopes, and safe ids.
 */
export function logServerActionError(
  scope: string,
  error: LoggableError,
  extra?: Record<string, string | number | boolean | null | undefined>,
): void {
  const { code, message } = normalizeError(error);
  console.error(scope, {
    code,
    message,
    ...extra,
  });
}
