export type HighlightTarget = {
  selector: string;
};

const HIGHLIGHT_STYLE = "outline: 3px solid #f4a261; outline-offset: 4px; border-radius: 4px;";
const AUTO_CLEAR_MS = 8000;

export function highlightAndScroll(targets: HighlightTarget[]): () => void {
  const restores: Array<() => void> = [];

  let scrolled = false;

  for (const { selector } of targets) {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) {
      continue;
    }

    const original = el.style.cssText;
    el.style.cssText = original + "; " + HIGHLIGHT_STYLE;
    restores.push(() => {
      el.style.cssText = original;
    });

    if (!scrolled) {
      if (typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      scrolled = true;
    }
  }

  const cleanup = () => {
    for (const restore of restores) {
      restore();
    }
    restores.length = 0;
  };

  const timer = setTimeout(cleanup, AUTO_CLEAR_MS);

  return () => {
    clearTimeout(timer);
    cleanup();
  };
}
