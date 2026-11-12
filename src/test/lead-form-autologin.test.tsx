import { forwardRef, useEffect } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SubmitResult } from "@/lib/submit-lead";

const submitLead = vi.fn<(input: unknown) => Promise<SubmitResult>>();
const goTo = vi.fn<(url: string) => void>();
vi.mock("@/lib/submit-lead", () => ({ submitLead: (i: unknown) => submitLead(i) }));
vi.mock("@/lib/navigate", () => ({ goTo: (u: string) => goTo(u) }));
vi.mock("@/lib/meta-pixel", () => ({ trackLead: vi.fn() }));
vi.mock("@/lib/turnstile", () => ({
  CAPTCHA_ENABLED: true,
  TURNSTILE_SITE_KEY: "test-key",
  TURNSTILE_ACTION: "lead",
  CAPTCHA_ERROR: "captcha",
}));
// The captcha passes at once, so tests can submit without Cloudflare.
vi.mock("@/components/landing/Turnstile", () => ({
  Turnstile: forwardRef<unknown, { onToken: (t: string) => void }>(function Turnstile(
    { onToken },
    _ref,
  ) {
    useEffect(() => onToken("tok"), [onToken]);
    return null;
  }),
}));

const { LeadForm, AUTOLOGIN_DELAY_MS } = await import("@/components/landing/LeadForm");

const URL_OK = "https://crm.example/autologin?t=abc";
const { whatsappLink } = await import("@/lib/bonus");
const WHATSAPP_URL = whatsappLink();

function fakeTab() {
  return {
    closed: false,
    opener: {} as unknown,
    document: { title: "", body: { innerHTML: "" } },
    location: { replace: vi.fn() },
    close: vi.fn(),
  };
}

let open: ReturnType<typeof vi.fn>;
beforeEach(() => {
  open = vi.fn();
  vi.stubGlobal("open", open);
  submitLead.mockReset();
  goTo.mockReset();
});
afterEach(() => vi.unstubAllGlobals());

function fillToBanner() {
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
}

function fillAndSubmit() {
  fillToBanner();
  fireEvent.click(screen.getByText("Ativar meu bônus no WhatsApp"));
}

describe("LeadForm after signup", () => {
  it("opens WhatsApp in a new tab and sends this tab to the autologin URL", async () => {
    const tab = fakeTab();
    open.mockReturnValue(tab);
    let openedBeforeRequest = false;
    submitLead.mockImplementation(async () => {
      openedBeforeRequest = open.mock.calls.length === 1;
      return { ok: true, autologinUrl: URL_OK };
    });

    fillAndSubmit();
    await screen.findByText(/Cadastro recebido/);

    // The tab opens during the click (or the browser blocks it), then gets WhatsApp.
    expect(openedBeforeRequest).toBe(true);
    expect(open).toHaveBeenCalledWith("", "_blank");
    expect(tab.opener).toBeNull();
    expect(tab.document.body.innerHTML).toContain("Abrindo o WhatsApp…");
    expect(tab.location.replace).toHaveBeenCalledWith(WHATSAPP_URL);
    expect(tab.close).not.toHaveBeenCalled();
    expect(screen.getByText("Redirecionando para sua conta...")).toBeInTheDocument();

    // This tab goes to the account after the success message.
    expect(goTo).not.toHaveBeenCalled();
    await waitFor(() => expect(goTo).toHaveBeenCalledWith(URL_OK), {
      timeout: AUTOLOGIN_DELAY_MS + 1000,
    });
  });

  it("still opens the WhatsApp tab when there is no autologin URL, and stays here", async () => {
    const tab = fakeTab();
    open.mockReturnValue(tab);
    submitLead.mockResolvedValue({ ok: true });

    fillAndSubmit();
    await screen.findByText(/Cadastro recebido/);
    expect(tab.location.replace).toHaveBeenCalledWith(WHATSAPP_URL);
    expect(tab.close).not.toHaveBeenCalled();
    expect(screen.queryByText("Redirecionando para sua conta...")).not.toBeInTheDocument();
    await new Promise((r) => setTimeout(r, AUTOLOGIN_DELAY_MS + 100));
    expect(goTo).not.toHaveBeenCalled();
  });

  it("closes the tab when the submit fails", async () => {
    const tab = fakeTab();
    open.mockReturnValue(tab);
    submitLead.mockResolvedValue({ ok: false, error: "Falhou" });

    fillAndSubmit();
    await screen.findByText("Falhou");
    expect(tab.close).toHaveBeenCalled();
    expect(tab.location.replace).not.toHaveBeenCalled();
  });

  it("closes the tab when the request throws", async () => {
    const tab = fakeTab();
    open.mockReturnValue(tab);
    submitLead.mockRejectedValue(new Error("boom"));

    fillAndSubmit();
    await waitFor(() => expect(tab.close).toHaveBeenCalled());
  });

  it("when the tab is blocked, stays here with the WhatsApp button and a link to the account", async () => {
    open.mockReturnValue(null);
    submitLead.mockResolvedValue({ ok: true, autologinUrl: URL_OK });

    fillAndSubmit();
    const link = (await screen.findByText("Acessar minha conta")).closest("a")!;
    expect(link).toHaveAttribute("href", URL_OK);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText(/Deposite US\$250 e opere com US\$500/)).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, AUTOLOGIN_DELAY_MS + 100));
    expect(goTo).not.toHaveBeenCalled();
  });
});

describe("LeadForm bonus step", () => {
  it("shows the bonus banner after the questions, without sending the lead yet", () => {
    fillToBanner();
    expect(screen.getByText(/no seu primeiro depósito/)).toBeInTheDocument();
    expect(screen.queryByText("Cadastro recebido")).not.toBeInTheDocument();
    expect(screen.getByText("Ativar meu bônus no WhatsApp")).toBeInTheDocument();
    expect(submitLead).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it("keeps the questions open until they are all answered", () => {
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
    fireEvent.click(screen.getByText("Continuar"));
    expect(screen.getByText("Responda todas as perguntas")).toBeInTheDocument();
    expect(screen.queryByText("Ativar meu bônus no WhatsApp")).not.toBeInTheDocument();
  });
});
