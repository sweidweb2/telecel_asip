/** Stable Turnstile `data-action` for the public contact form. */
export const TURNSTILE_CONTACT_ACTION = "contact";

/** Stable Turnstile `data-action` for the public apply / interest registration form. */
export const TURNSTILE_APPLY_ACTION = "apply";

/** Stable Turnstile `data-action` for the Insights newsletter signup. */
export const TURNSTILE_NEWSLETTER_ACTION = "newsletter";

/** Stable Turnstile `data-action` for the login form. */
export const TURNSTILE_LOGIN_ACTION = "login";

/** Stable Turnstile `data-action` for the signup form. */
export const TURNSTILE_SIGNUP_ACTION = "signup";

export type TurnstileWidgetId = string;

export type TurnstileRenderOptions = {
  sitekey: string;
  action: string;
  callback: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
};

export type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions,
  ) => TurnstileWidgetId;
  reset: (widgetId: TurnstileWidgetId) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export {};
