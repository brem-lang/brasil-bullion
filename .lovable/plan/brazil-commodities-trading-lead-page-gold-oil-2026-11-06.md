# Brazil Commodities Trading Lead Page (Gold & Oil)

## Goal
A high-converting landing page in Brazilian Portuguese (pt-BR) for adults 30+ who want to trade gold and oil, starting from a US$250 minimum deposit. A short registration form with qualifying questions sends each lead to your CRM.

## Visual direction
- Palette: deep emerald green + rich gold on warm cream. It hints at Brazil's colors and gold, and reads as premium and trustworthy for a 30+ audience (no flashy crypto neon).
- Type: Sora for headlines (bold, modern) + Manrope for body text (readable at larger sizes for older readers).
- Generated photos: a confident Brazilian professional in their 40s using a trading app, plus gold bars and an oil barrel motif.

## Page sections (one long scrolling page)
1. Sticky top bar: generic brand mark ("Commodities Brasil"), "Cadastre-se" button.
2. Hero: headline ("Invista em Ouro e Petróleo a partir de US$250"), subhead, live-style gold/oil price ticker (sample figures), trust badges, and the registration form right on the page.
3. Why gold and oil: 3 cards (protection against inflation and a weak real, global demand, trade both rising and falling prices).
4. How it works: 3 steps (register, get a call from a specialist, start with US$250).
5. Built for you (30+): personal account manager, Portuguese support, education materials, mobile app.
6. Testimonials: 3 Brazilian personas (sample, marked as illustrative).
7. FAQ accordion: minimum deposit, risk, withdrawals in PIX, support hours.
8. Final call to action repeating the form.
9. Footer with a risk warning ("Trading involves risk of loss...") and links to privacy/terms.

## Registration form (multi-step, fast)
Step 1: Name, email, WhatsApp phone (+55 prefilled).
Step 2 (filters):
- Age 30+ confirmation (required, under 30 blocked politely).
- Trading experience: None / Beginner / Experienced.
- Main goal: Extra monthly income / Grow savings long term / Protect against inflation / Learn to trade.
- Can you start with US$250? Yes / Not yet (kept as a lead score).
Then a thank-you screen ("Um especialista entrará em contato via WhatsApp").
Each lead gets a quality score (high/medium/low) from the answers, sent with the lead.

## Lead delivery
Leads post to a server route that forwards them to your CRM webhook URL (stored as a secret). You will need to give me the webhook URL; until then, submissions show a clear error instead of pretending success.

## Compliance
No guaranteed-profit claims; visible risk disclaimer; consent checkbox (LGPD) on the form.

## Technical details
- `src/routes/index.tsx` rebuilt with sections as components in `src/components/landing/`; full pt-BR head() metadata, `lang="pt-BR"`.
- Design tokens in `src/styles.css` (oklch emerald/gold/cream), fonts via `<link>` in `__root.tsx`.
- Server function validates with zod and POSTs JSON to `CRM_WEBHOOK_URL` secret; UTM params captured from the URL and included.
- Unit test for the lead-score rule.
