/** Sends this tab to another page. Its own module so tests can replace it (jsdom can't navigate). */
export function goTo(url: string): void {
  window.location.assign(url);
}
