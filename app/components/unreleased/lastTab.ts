// Remembers which Exclusive top-level tab and which Unreleased sub-tab the
// visitor was last on, so navigating into a track/video/image detail page
// and back restores the exact same view — not just the Unreleased tab in
// general, but the specific Videos/Music/Images sub-tab too. Backed by
// sessionStorage (not the URL) so it works whether the visitor uses the
// browser Back button or the in-page "Unreleased" link.

const TOP_TAB_KEY = "exclusive:last-tab";
const SUB_TAB_KEY = "exclusive:last-unreleased-subtab";

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private browsing, quota) — losing the
    // remembered tab is harmless, so just skip it.
  }
}

export const getLastTopTab = () => read(TOP_TAB_KEY);
export const setLastTopTab = (value: string) => write(TOP_TAB_KEY, value);

export const getLastSubTab = () => read(SUB_TAB_KEY);
export const setLastSubTab = (value: string) => write(SUB_TAB_KEY, value);
