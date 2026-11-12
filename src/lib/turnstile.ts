// Cloudflare Turnstile captcha settings shared by the form and the server.

/**
 * Captcha on/off switch, shared by the form (shows the widget) and the server (requires a
 * valid token). Off unless VITE_CAPTCHA_ENABLED=true at build time; the keys below stay
 * configured so it can be switched back on without other changes.
 */
export const CAPTCHA_ENABLED: boolean = import.meta.env["VITE_CAPTCHA_ENABLED"] === "true";

/** Cloudflare's public test key: the widget always passes. Used by `npm run dev` when no key is set. */
const TEST_SITE_KEY = "1x00000000000000000000AA";

/** Public site key (safe in the page). Set VITE_TURNSTILE_SITE_KEY before `npm run build`. */
export const TURNSTILE_SITE_KEY: string =
  import.meta.env["VITE_TURNSTILE_SITE_KEY"] || (import.meta.env.DEV ? TEST_SITE_KEY : "");

/** Widget action, checked on the server so a token from another widget is not accepted. */
export const TURNSTILE_ACTION = "lead";

/** Shown when verification fails; the widget is reset so the visitor can try again. */
export const CAPTCHA_ERROR = "Confirme a verificação de segurança e tente novamente.";
