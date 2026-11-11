// First-deposit bonus offer, shown in the tab that opens after a successful signup.

/** `?bonus=1` on /cadastro shows the bonus offer instead of the signup forms. */
export const BONUS_PARAM = "bonus";

/** Digits only, with country code (e.g. 5511987654321). Set VITE_WHATSAPP_NUMBER before building. */
export const WHATSAPP_NUMBER: string = String(
  import.meta.env["VITE_WHATSAPP_NUMBER"] ?? "",
).replace(/\D/g, "");

const WHATSAPP_MESSAGE =
  "Olá! Acabei de me cadastrar e quero ativar o bônus de 100% no meu primeiro depósito.";

/**
 * wa.me link with the message pre-filled. Without a number (not configured yet) WhatsApp
 * opens with the message and asks which chat to send it to.
 */
export function whatsappLink(): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

/** /cadastro with the bonus offer switched on (keeps UTMs, drops the #hash). */
export function bonusUrl(href: string): string {
  const url = new URL(href);
  // Only /cadastro shows the offer (in place of its forms).
  url.pathname = "/cadastro";
  url.searchParams.set(BONUS_PARAM, "1");
  url.hash = "";
  return url.href;
}

export function isBonusSearch(searchStr: string): boolean {
  return new URLSearchParams(searchStr).get(BONUS_PARAM) === "1";
}
