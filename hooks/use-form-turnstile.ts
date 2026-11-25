"use client";

import { useCallback } from "react";
import {
  useWatch,
  type Control,
  type FieldValues,
  type Path,
  type UseFormSetValue,
} from "react-hook-form";

import {
  useTurnstile,
  type TurnstileController,
} from "@/hooks/use-turnstile";
import { resolveTurnstileToken } from "@/lib/turnstile-widget";

const DEFAULT_FIELD = "turnstileToken";

type UseFormTurnstileOptions<TFieldValues extends FieldValues> = {
  /** Stable Turnstile `data-action` from `@/types/turnstile`. */
  action: string;
  control: Control<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  /** RHF field name. Defaults to `turnstileToken`. */
  name?: Path<TFieldValues>;
};

export type FormTurnstile = {
  turnstile: TurnstileController;
  /** Current watched token (may be empty before the widget / bypass lands). */
  turnstileToken: string;
  hasToken: boolean;
  /** Prefer watched token, then any submit-time candidates; force bypass when off. */
  submitToken: (
    ...candidates: Array<string | undefined | null>
  ) => string;
  reset: TurnstileController["reset"];
};

/**
 * Binds {@link useTurnstile} to a react-hook-form `turnstileToken` field:
 * watch, setValue, submit resolution, and reset.
 */
export function useFormTurnstile<TFieldValues extends FieldValues>({
  action,
  control,
  setValue,
  name = DEFAULT_FIELD as Path<TFieldValues>,
}: UseFormTurnstileOptions<TFieldValues>): FormTurnstile {
  const watched = useWatch({ control, name }) as string | undefined;

  const turnstile = useTurnstile({
    action,
    onTokenChange: useCallback(
      (token: string) => {
        setValue(name, token as TFieldValues[typeof name], {
          shouldValidate: token !== "",
          shouldDirty: true,
        });
      },
      [name, setValue],
    ),
  });

  const turnstileToken = watched ?? "";

  return {
    turnstile,
    turnstileToken,
    hasToken: Boolean(turnstileToken),
    submitToken: (...candidates) =>
      resolveTurnstileToken(turnstileToken, ...candidates),
    reset: turnstile.reset,
  };
}
