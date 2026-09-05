import { format, parseISO } from "date-fns";

/** Admin list / detail date (no time). */
export const ADMIN_DATE_FORMAT = "MMM d, yyyy";

/** Admin timestamps with time. */
export const ADMIN_DATETIME_FORMAT = "MMM d, yyyy · HH:mm";

function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  // Prefer parseISO for date-only / ISO strings from Postgres.
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      return parseISO(value);
    } catch {
      return new Date(value);
    }
  }
  return new Date(value);
}

/** Format a calendar date for admin CMS UI. */
export function formatAdminDate(value: string | Date): string {
  return format(toDate(value), ADMIN_DATE_FORMAT);
}

/** Format a date-time for admin CMS UI. */
export function formatAdminDateTime(value: string | Date): string {
  return format(toDate(value), ADMIN_DATETIME_FORMAT);
}
