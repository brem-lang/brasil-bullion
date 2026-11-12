// Static copy of <RouteLoader> for a blank tab, which has none of the app's CSS.
// Colors are the theme tokens from src/styles.css (--deep, --gold, --gradient-gold).

const COINS_ICON =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>';

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Body markup (with its own <style>) for a tab that shows the loader until it navigates. */
export function loaderPageHtml(message: string, durationMs = 2000): string {
  return `<style>
html,body{margin:0;height:100%}
body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:0 24px;box-sizing:border-box;background:oklch(0.2 0.05 162);color:oklch(0.96 0.02 85);font-family:"Sora",system-ui,sans-serif}
.ring{position:relative;display:grid;place-items:center;width:80px;height:80px}
.ring::before{content:"";position:absolute;inset:0;border-radius:9999px;border:4px solid color-mix(in oklab,oklch(0.8 0.14 84) 20%,transparent);border-top-color:oklch(0.8 0.14 84);animation:spin 1s linear infinite}
.coin{display:grid;place-items:center;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,oklch(0.9 0.11 92),oklch(0.8 0.14 84) 50%,oklch(0.66 0.13 70));color:oklch(0.2 0.04 160)}
p{margin:0;text-align:center;font-size:18px;font-weight:700}
.bar{width:224px;height:6px;overflow:hidden;border-radius:9999px;background:color-mix(in oklab,oklch(0.96 0.02 85) 15%,transparent)}
.fill{height:100%;width:0;background:linear-gradient(135deg,oklch(0.9 0.11 92),oklch(0.8 0.14 84) 50%,oklch(0.66 0.13 70));animation:fill ${durationMs}ms ease-out forwards}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fill{to{width:100%}}
@media (prefers-reduced-motion:reduce){.ring::before{animation:none}}
</style>
<div class="ring" role="status" aria-live="polite"><span class="coin">${COINS_ICON}</span></div>
<p>${escapeHtml(message)}</p>
<div class="bar"><div class="fill"></div></div>`;
}
