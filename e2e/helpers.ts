import { customAlphabet } from "nanoid";

/** Lowercase alphanumeric only — safe for slug suffixes (no `_` / `-`). */
const e2eAlphabet = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

export function e2eSuffix(): string {
  return e2eAlphabet();
}
