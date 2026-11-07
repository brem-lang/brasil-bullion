import { createServerFn } from "@tanstack/react-start";
import { leadSchema, scoreLead } from "./lead";

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env["CRM_WEBHOOK_URL"];
    if (!url) {
      return { ok: false as const, error: "Cadastro temporariamente indisponível. Tente novamente mais tarde." };
    }
    const payload = {
      ...data,
      name: `${data.firstName} ${data.lastName}`.trim(),
      score: scoreLead(data),
      source: "landing-commodities-br",
      submittedAt: new Date().toISOString(),
    };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`CRM ${res.status}`);
      return { ok: true as const };
    } catch (e) {
      console.error("Lead delivery failed", e);
      return { ok: false as const, error: "Não foi possível enviar agora. Tente novamente em instantes." };
    }
  });
