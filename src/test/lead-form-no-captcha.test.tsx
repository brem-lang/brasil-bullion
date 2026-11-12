import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import type { SubmitResult } from "@/lib/submit-lead";

const submitLead = vi.fn<(input: unknown) => Promise<SubmitResult>>();
const turnstileRendered = vi.fn();
vi.mock("@/lib/submit-lead", () => ({ submitLead: (i: unknown) => submitLead(i) }));
vi.mock("@/lib/navigate", () => ({ goTo: vi.fn() }));
vi.mock("@/lib/meta-pixel", () => ({ trackLead: vi.fn() }));
// Captcha switched off, but its keys still configured.
vi.mock("@/lib/turnstile", () => ({
  CAPTCHA_ENABLED: false,
  TURNSTILE_SITE_KEY: "test-key",
  TURNSTILE_ACTION: "lead",
  CAPTCHA_ERROR: "captcha",
}));
vi.mock("@/components/landing/Turnstile", () => ({
  Turnstile: () => {
    turnstileRendered();
    return null;
  },
}));

const { LeadForm } = await import("@/components/landing/LeadForm");

it("with the captcha off, the banner has no widget and the lead goes out without a token", async () => {
  vi.stubGlobal(
    "open",
    vi.fn(() => null),
  );
  submitLead.mockResolvedValue({ ok: true });
  render(<LeadForm />);
  fireEvent.change(screen.getByPlaceholderText("Nome"), { target: { value: "Maria" } });
  fireEvent.change(screen.getByPlaceholderText("Sobrenome"), { target: { value: "Silva" } });
  fireEvent.change(screen.getByPlaceholderText("Seu melhor e-mail"), {
    target: { value: "maria.silva@gmail.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("(11) 98765-4321"), {
    target: { value: "11987654321" },
  });
  fireEvent.click(screen.getByText(/30 anos ou mais/));
  fireEvent.click(screen.getByText("Continuar"));
  fireEvent.click(screen.getByText("Nunca operei"));
  fireEvent.click(screen.getByText("Renda extra mensal"));
  fireEvent.click(screen.getByText("Sim, começo com US$250+"));
  fireEvent.click(screen.getByText(/Aceito ser contatado/));
  fireEvent.click(screen.getByText("Continuar"));
  fireEvent.click(screen.getByText("Ativar meu bônus no WhatsApp"));

  await waitFor(() => expect(submitLead).toHaveBeenCalled());
  expect(turnstileRendered).not.toHaveBeenCalled();
  expect((submitLead.mock.calls[0]![0] as { captchaToken?: string }).captchaToken).toBeUndefined();
  vi.unstubAllGlobals();
});
