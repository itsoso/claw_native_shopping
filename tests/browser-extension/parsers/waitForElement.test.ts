// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { waitForElement } from "../../../apps/browser-extension/src/parsers/waitForElement.js";

describe("waitForElement", () => {
  it("resolves immediately when element already exists", async () => {
    document.body.innerHTML = '<div class="target">found</div>';

    const el = await waitForElement(document, ".target");

    expect(el).not.toBeNull();
    expect(el!.textContent).toBe("found");
  });

  it("resolves when element is added dynamically", async () => {
    document.body.innerHTML = "<div></div>";

    const promise = waitForElement(document, ".delayed", { timeout: 2000 });

    setTimeout(() => {
      const el = document.createElement("span");
      el.className = "delayed";
      el.textContent = "arrived";
      document.body.appendChild(el);
    }, 50);

    const el = await promise;

    expect(el).not.toBeNull();
    expect(el!.textContent).toBe("arrived");
  });

  it("resolves with null after timeout", async () => {
    document.body.innerHTML = "<div></div>";

    const el = await waitForElement(document, ".never", { timeout: 100 });

    expect(el).toBeNull();
  });
});
