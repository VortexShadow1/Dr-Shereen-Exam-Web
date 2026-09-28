"use client";

/**
 * Browser-side anti-cheat helpers.
 * Note: These reduce casual AI use (copy-paste, tab switch).
 * They cannot fully stop a determined student using a second device or local AI.
 * Best combined with good question design (application, not pure recall).
 */

export function disableCopyPasteAndContextMenu() {
  const prevent = (e: Event) => e.preventDefault();

  document.addEventListener("contextmenu", prevent);
  document.addEventListener("copy", prevent);
  document.addEventListener("cut", prevent);
  document.addEventListener("paste", prevent);
  document.addEventListener("selectstart", prevent);
  document.addEventListener("dragstart", prevent);

  // Block common keyboard shortcuts
  const keyHandler = (e: KeyboardEvent) => {
    // Ctrl/Cmd + C, X, V, A, S, P, U
    if (
      (e.ctrlKey || e.metaKey) &&
      ["c", "x", "v", "a", "s", "p", "u"].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
    }
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (
      e.key === "F12" ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
    ) {
      e.preventDefault();
    }
  };
  document.addEventListener("keydown", keyHandler);

  return () => {
    document.removeEventListener("contextmenu", prevent);
    document.removeEventListener("copy", prevent);
    document.removeEventListener("cut", prevent);
    document.removeEventListener("paste", prevent);
    document.removeEventListener("selectstart", prevent);
    document.removeEventListener("dragstart", prevent);
    document.removeEventListener("keydown", keyHandler);
  };
}

export function requestExamFullscreen(): Promise<void> {
  const el = document.documentElement;
  if (el.requestFullscreen) {
    return el.requestFullscreen().catch(() => {});
  }
  return Promise.resolve();
}

export function exitFullscreen() {
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
