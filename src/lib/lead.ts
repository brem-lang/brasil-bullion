import { z } from "zod";

export const experienceOptions = [
  { value: "none", label: "Nunca operei" },
  { value: "beginner", label: "Iniciante (já testei)" },
  { value: "experienced", label: "Experiente" },
] as const;

export const goalOptions = [
  { value: "extra_income", label: "Renda extra mensal" },
  { value: "grow_savings", label: "Fazer meu patrimônio crescer" },
  { value: "inflation", label: "Proteger contra inflação" },
  { value: "learn", label: "Aprender a operar" },
] as const;

export const depositOptions = [
  { value: "yes", label: "Sim, começo com US$250+" },
  { value: "not_yet", label: "Ainda não" },
] as const;

export const leadSchema = z.object({
  firstName: z.string().trim().min(2, "Informe seu nome").max(60),
  lastName: z.string().trim().min(2, "Informe seu sobrenome").max(60),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{10,20}$/, "WhatsApp inválido"),
  over30: z.literal(true, { errorMap: () => ({ message: "Disponível apenas para maiores de 30 anos" }) }),
  experience: z.enum(["none", "beginner", "experienced"]),
  goal: z.enum(["extra_income", "grow_savings", "inflation", "learn"]),
  deposit: z.enum(["yes", "not_yet"]),
  consent: z.literal(true, { errorMap: () => ({ message: "Aceite os termos para continuar" }) }),
  utm: z.record(z.string().max(200)).optional(),
});

export type Lead = z.infer<typeof leadSchema>;
export type LeadScore = "high" | "medium" | "low";

/** Ready-to-deposit leads are the priority; experience and income goals raise quality. */
export function scoreLead(l: Pick<Lead, "experience" | "goal" | "deposit">): LeadScore {
  if (l.deposit === "not_yet") return "low";
  if (l.experience !== "none" || l.goal === "extra_income" || l.goal === "grow_savings") return "high";
  return "medium";
}
