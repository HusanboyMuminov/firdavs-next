import { useSyncExternalStore } from "react";

/**
 * The URL is the single source of truth for which screen/category/dish is
 * shown. Screens switch instantly on the client via the History API (which
 * Next.js integrates with), and every URL is also a prerendered page, so a
 * QR code or shared link opens the right screen directly.
 */

const NAV_EVENT = "firdavs:navigate";

/** What kind of entry we pushed, so "close"/"home" can go back instead of stacking history. */
type Marker = "view" | "dish";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(NAV_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(NAV_EVENT, onChange);
  };
}

function getSnapshot() {
  return window.location.pathname + window.location.search;
}

/** Current "pathname?search". `serverLocation` is what the server rendered. */
export function useLocation(serverLocation: string): string {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverLocation);
}

function currentMarker(): Marker | undefined {
  const state: unknown = window.history.state;
  if (state && typeof state === "object" && "firdavs" in state) {
    const value = (state as { firdavs?: { pushed?: Marker } }).firdavs?.pushed;
    return value;
  }
  return undefined;
}

export function navigate(href: string, push?: Marker) {
  if (push) {
    window.history.pushState({ firdavs: { pushed: push } }, "", href);
  } else {
    // Keep the marker of the entry we're replacing.
    window.history.replaceState({ firdavs: { pushed: currentMarker() } }, "", href);
  }
  window.dispatchEvent(new Event(NAV_EVENT));
}

/** Go back if the current entry was pushed by us as `marker`; otherwise replace with `fallback`. */
export function back(marker: Marker, fallback: string) {
  if (currentMarker() === marker) window.history.back();
  else navigate(fallback);
}
