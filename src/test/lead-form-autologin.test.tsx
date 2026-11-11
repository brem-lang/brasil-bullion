import { forwardRef, useEffect } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SubmitResult } from "@/lib/submit-lead";

const submitLead = vi.fn<(input: unknown) => Promise<SubmitResult>>();
vi.mock("@/lib/submit-lead", () => ({ submitLead: (i: unknown) => submitLead(i) }));
vi.mock("@/lib/meta-pixel", () => ({ trackLead: vi.fn() }));
vi.mock("@/lib/turnstile", () => ({
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

const { LeadForm } = await import("@/components/landing/LeadForm");

const URL_OK = "https://crm.example/autologin?t=abc";

function fakeTab() {
  return {
    closed: false,
    opener: {} as unknown,
    document: { title: "", body: { innerHTML: "" } },
    location: { replace: vi.fn() },
    close: vi.fn(),
    blur: vi.fn(),
  };
}

let open: ReturnType<typeof vi.fn>;
let focus: ReturnType<typeof vi.fn>;
beforeEach(() => {
  open = vi.fn();
  focus = vi.fn();
  vi.stubGlobal("open", open);
  vi.stubGlobal("focus", focus);
  submitLead.mockReset();
});
afterEach(() => vi.unstubAllGlobals());

function fillAndSubmit() {
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
  fireEvent.click(screen.getByText("Quero começar agora"));
}

describe("LeadForm autologin tab", () => {
  it("opens the tab during the click and sends it to the autologin URL", async () => {
    const tab = fakeTab();
    open.mockReturnValue(tab);
    let openedBeforeRequest = false;
    submitLead.mockImplementation(async () => {
      openedBeforeRequest = open.mock.calls.length === 1;
      return { ok: true, autologinUrl: URL_OK };
    });

    fillAndSubmit();
    await screen.findByText(/Cadastro recebido/);

    expect(openedBeforeRequest).toBe(true);
    expect(open).toHaveBeenCalledWith("", "_blank");
    expect(tab.opener).toBeNull();
    expect(tab.location.replace).toHaveBeenCalledWith(URL_OK);
    expect(tab.close).not.toHaveBeenCalled();
    // Tries to keep this tab in front, both when opening and after navigating.
    expect(tab.blur).toHaveBeenCalledTimes(2);
    expect(focus).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Sua conta foi aberta em uma nova aba.")).toBeInTheDocument();
    expect(screen.queryByText("Acessar minha conta")).not.toBeInTheDocument();
  });

  it("closes the tab when there is no autologin URL", async () => {
    const tab = fakeTab();
    open.mockReturnValue(tab);
    submitLead.mockResolvedValue({ ok: true });

    fillAndSubmit();
    await screen.findByText(/Cadastro recebido/);
    expect(tab.close).toHaveBeenCalled();
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

  it("shows a link to open the account when the browser blocks the tab", async () => {
    open.mockReturnValue(null);
    submitLead.mockResolvedValue({ ok: true, autologinUrl: URL_OK });

    fillAndSubmit();
    const link = (await screen.findByText("Acessar minha conta")).closest("a")!;
    expect(link).toHaveAttribute("href", URL_OK);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.queryByText("Sua conta foi aberta em uma nova aba.")).not.toBeInTheDocument();
  });
});
