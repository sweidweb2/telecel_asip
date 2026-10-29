import { redirect } from "next/navigation";

import {
  httpErrorHref,
  type HttpErrorKind,
} from "@/constants/http-errors";

/**
 * Server-side navigation to a themed HTTP status page.
 * Use for expected access / availability failures in Server Components.
 */
export function redirectToHttpError(
  kind: HttpErrorKind,
  options?: { digest?: string; code?: string },
): never {
  redirect(httpErrorHref(kind, options));
}
