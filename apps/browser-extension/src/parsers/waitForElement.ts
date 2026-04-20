export type WaitForElementOptions = {
  timeout?: number | undefined;
};

export function waitForElement(
  root: ParentNode,
  selector: string,
  options?: WaitForElementOptions,
): Promise<Element | null> {
  const timeout = options?.timeout ?? 5000;

  const existing = root.querySelector(selector);
  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    let settled = false;

    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el && !settled) {
        settled = true;
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(root instanceof Document ? root.documentElement : root, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      if (!settled) {
        settled = true;
        observer.disconnect();
        resolve(null);
      }
    }, timeout);
  });
}
