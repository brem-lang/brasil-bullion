import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, Gift, MessageCircle, ShieldCheck } from "lucide-react";
import { whatsappLink } from "@/lib/bonus";

const PERKS = [
  "Um especialista ativa seu bônus em minutos",
  "Atendimento em português, direto no WhatsApp",
  "Depósito rápido via PIX",
];

/** Classes for the green WhatsApp call to action (link or button). */
const whatsappCls = (large: boolean) =>
  `group flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] font-bold text-white shadow-lg shadow-[#25D366]/30 transition hover:scale-[1.02] hover:brightness-105 disabled:pointer-events-none disabled:opacity-60 ${
    large ? "px-6 py-4 text-lg" : "px-5 py-3 text-base"
  }`;

function WhatsAppLabel({ large, children }: { large: boolean; children: ReactNode }) {
  return (
    <>
      <MessageCircle className={large ? "h-6 w-6" : "h-5 w-5"} aria-hidden="true" />
      {children}
      <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden="true" />
    </>
  );
}

/** Green WhatsApp link; goes to VITE_WHATSAPP_NUMBER once that is set. */
function WhatsAppButton({ large = false }: { large?: boolean }) {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      className={whatsappCls(large)}
    >
      <WhatsAppLabel large={large}>Fale agora no WhatsApp</WhatsAppLabel>
    </a>
  );
}

/** Same look as the WhatsApp link, as a button (the form's submit). */
export function WhatsAppActionButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={whatsappCls(true)}>
      <WhatsAppLabel large>{children}</WhatsAppLabel>
    </button>
  );
}

/**
 * The 100% first-deposit bonus. The signup form shows it as its last step, with `action`
 * (the button that sends the lead) in place of the WhatsApp link and without the
 * "Cadastro recebido" badge. Also shown on /cadastro?bonus=1 in place of the signup form.
 */
export function BonusOffer({
  id,
  received = true,
  action,
}: {
  id?: string | undefined;
  /** Show the "Cadastro recebido" badge (the lead is already in). */
  received?: boolean;
  /** Replaces the default WhatsApp link. */
  action?: ReactNode;
}) {
  return (
    <div
      id={id}
      className="relative scroll-mt-24 self-center overflow-hidden rounded-2xl border-2 border-gold bg-card p-6 text-card-foreground shadow-gold sm:p-8"
    >
      {received && (
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Cadastro recebido
        </span>
      )}

      <div className="flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-accent-foreground shadow-gold">
          <Gift className="h-8 w-8" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Presente de boas-vindas
          </p>
          <h3 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            <span className="text-gold-gradient">100% de bônus</span> no seu primeiro depósito
          </h3>
        </div>
      </div>

      {/* What 100% means, in numbers: the minimum deposit doubled. */}
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl bg-secondary p-4 text-center">
        <div>
          <div className="text-xs font-medium text-muted-foreground">Você deposita</div>
          <div className="font-display text-2xl font-bold">US$250</div>
        </div>
        <ArrowRight className="h-6 w-6 text-gold" aria-hidden="true" />
        <div>
          <div className="text-xs font-medium text-muted-foreground">Você opera com</div>
          <div className="font-display text-3xl font-extrabold text-gold-gradient">US$500</div>
        </div>
      </div>

      <ul className="mt-6 space-y-2.5">
        {PERKS.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm font-medium">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            {p}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center text-base font-semibold">
        Seu especialista está esperando. Fale agora e ative seu bônus!
      </p>
      <div className="mt-3">{action ?? <WhatsAppButton large />}</div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Válido para o primeiro depósito. Sujeito aos termos da promoção.
      </p>
    </div>
  );
}

/** Compact version for the success screen when the browser blocked the WhatsApp tab. */
export function BonusBanner() {
  return (
    <div className="mt-6 rounded-xl border-2 border-gold bg-secondary p-5 text-left">
      <div className="flex items-center gap-3">
        <Gift className="h-8 w-8 shrink-0 text-gold" aria-hidden="true" />
        <p className="font-display text-lg font-extrabold leading-tight">
          <span className="text-gold-gradient">100% de bônus</span> no seu primeiro depósito
        </p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Deposite US$250 e opere com US$500. Fale com um especialista e ative agora.
      </p>
      <div className="mt-4">
        <WhatsAppButton />
      </div>
    </div>
  );
}
