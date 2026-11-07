import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { depositOptions, experienceOptions, goalOptions, leadSchema } from "@/lib/lead";
import { submitLead } from "@/lib/lead.functions";

type Opt = { value: string; label: string };

function Choice({ label, options, value, onChange }: { label: string; options: readonly Opt[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-foreground">{label}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((o) => (
          <button
            type="button"
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition ${
              value === o.value ? "border-accent bg-accent/15 text-foreground ring-2 ring-accent" : "border-input bg-background hover:border-accent"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-background px-4 py-3 text-base outline-none focus:border-accent focus:ring-2 focus:ring-ring";

export function LeadForm({ id }: { id?: string }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "+55 ", over30: false, experience: "", goal: "", deposit: "", consent: false });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [utm, setUtm] = useState<Record<string, string>>({});

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const u: Record<string, string> = {};
    p.forEach((v, k) => { if (k.startsWith("utm_") || k === "gclid" || k === "fbclid") u[k] = v.slice(0, 200); });
    setUtm(u);
  }, []);

  const set = (k: keyof typeof f, v: unknown) => setF((s) => ({ ...s, [k]: v }));

  const next = () => {
    const r = leadSchema.pick({ firstName: true, lastName: true, email: true, phone: true }).safeParse(f);
    if (!r.success) return setErr(r.error.issues[0]?.message ?? "Erro");
    setErr(""); setStep(2);
  };

  const submit = async () => {
    const r = leadSchema.safeParse({ ...f, utm });
    if (!r.success) {
      const issue = r.error.issues[0];
      return setErr(["experience", "goal", "deposit"].includes(String(issue?.path[0])) ? "Responda todas as perguntas" : (issue?.message ?? "Erro"));
    }
    setErr(""); setLoading(true);
    try {
      const res = await submitLead({ data: r.data });
      if (res.ok) setStep(3); else setErr(res.error);
    } catch { setErr("Não foi possível enviar agora. Tente novamente."); }
    finally { setLoading(false); }
  };

  return (
    <div id={id} className="scroll-mt-24 self-center rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-card sm:p-8">
      {step === 3 ? (
        <div className="py-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
          <h3 className="mt-4 text-2xl font-bold">Cadastro recebido, {f.firstName}!</h3>
          <p className="mt-2 text-muted-foreground">Um especialista entrará em contato via WhatsApp em breve. Fique de olho no seu celular.</p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold">{step === 1 ? "Abra sua conta grátis" : "Só mais 3 perguntas"}</h3>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">Passo {step} de 2</span>
          </div>
          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gold-gradient transition-all" style={{ width: step === 1 ? "50%" : "100%" }} />
          </div>

          {step === 1 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input className={inputCls} placeholder="Nome" autoComplete="given-name" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} maxLength={60} />
                <input className={inputCls} placeholder="Sobrenome" autoComplete="family-name" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} maxLength={60} />
              </div>
              <input className={inputCls} type="email" placeholder="Seu melhor e-mail" value={f.email} onChange={(e) => set("email", e.target.value)} maxLength={255} />
              <input className={inputCls} type="tel" placeholder="WhatsApp com DDD" value={f.phone} onChange={(e) => set("phone", e.target.value)} maxLength={20} />
              <label className="flex items-start gap-3 pt-1 text-sm">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={f.over30} onChange={(e) => set("over30", e.target.checked)} />
                Confirmo que tenho <strong>30 anos ou mais</strong>
              </label>
              {err && <p className="text-sm font-medium text-destructive">{err}</p>}
              <button
                type="button"
                onClick={() => { if (!f.over30) return setErr("Disponível apenas para maiores de 30 anos"); next(); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-gradient px-6 py-4 text-lg font-bold text-accent-foreground shadow-gold transition hover:brightness-105"
              >
                Continuar <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <Choice label="1. Qual sua experiência com investimentos?" options={experienceOptions} value={f.experience} onChange={(v) => set("experience", v)} />
              <Choice label="2. Qual seu principal objetivo?" options={goalOptions} value={f.goal} onChange={(v) => set("goal", v)} />
              <Choice label="3. Pode começar com o depósito mínimo de US$250?" options={depositOptions} value={f.deposit} onChange={(v) => set("deposit", v)} />
              <label className="flex items-start gap-3 text-xs text-muted-foreground">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-primary" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} />
                Aceito ser contatado por telefone, WhatsApp e e-mail e concordo com a Política de Privacidade (LGPD).
              </label>
              {err && <p className="text-sm font-medium text-destructive">{err}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="rounded-lg border border-input px-4 py-4 text-sm font-semibold">Voltar</button>
                <button type="button" disabled={loading} onClick={submit} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold-gradient px-6 py-4 text-lg font-bold text-accent-foreground shadow-gold transition hover:brightness-105 disabled:opacity-60">
                  {loading ? "Enviando..." : "Quero começar agora"}
                </button>
              </div>
            </div>
          )}
          <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Dados protegidos</span>
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Sem custo de cadastro</span>
          </div>
        </>
      )}
    </div>
  );
}
