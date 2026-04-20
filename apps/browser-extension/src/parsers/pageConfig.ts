export type JdPageConfig = {
  skuId: string | null;
  cat: string | null;
  pType: number | null;
  brand: string | null;
  venderId: string | null;
  shopId: string | null;
};

function matchField(text: string, pattern: RegExp): string | null {
  const m = pattern.exec(text);
  return m?.[1] ?? null;
}

export function extractPageConfig(document: Document): JdPageConfig | null {
  const scripts = document.querySelectorAll("script");

  for (const script of scripts) {
    const text = script.textContent ?? "";
    if (!/var\s+pageConfig\s*=/.test(text)) {
      continue;
    }

    try {
      const skuId =
        matchField(text, /skuId\s*:\s*['"](\d+)['"]/) ??
        matchField(text, /skuId\s*:\s*(\d+)/);

      if (!skuId) {
        return null;
      }

      const pTypeStr = matchField(text, /pType\s*:\s*(\d+)/);
      const pType = pTypeStr !== null ? Number.parseInt(pTypeStr, 10) : null;

      const catMatch = text.match(/cat\s*:\s*\[([^\]]+)\]/);
      const cat = catMatch ? catMatch[1]!.replace(/\s/g, "") : null;

      const brand = matchField(text, /brand\s*:\s*['"]?(\d+)['"]?/);
      const venderId = matchField(text, /venderId\s*:\s*['"]?(\d+)['"]?/);
      const shopId =
        matchField(text, /shopId\s*:\s*['"](\d+)['"]/) ??
        matchField(text, /shopId\s*:\s*(\d+)/);

      return { skuId, cat, pType, brand, venderId, shopId };
    } catch {
      return null;
    }
  }

  return null;
}
