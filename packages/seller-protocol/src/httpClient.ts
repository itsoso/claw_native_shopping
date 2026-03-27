export type SellerHttpClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export const buildSellerHttpUrl = (baseUrl: string, path: string): string =>
  new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();

export const createSellerHttpClient = (options: SellerHttpClientOptions) => {
  const fetchImpl = options.fetch ?? fetch;

  return {
    buildUrl(path: string): string {
      return buildSellerHttpUrl(options.baseUrl, path);
    },

    async postJson<T>(
      path: string,
      payload: unknown,
      label: string,
      parse: (value: unknown) => T,
    ): Promise<T> {
      const hasPayload = payload !== undefined;
      const response = await fetchImpl(this.buildUrl(path), {
        method: "POST",
        ...(hasPayload
          ? {
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          : {}),
      });

      if (!response.ok) {
        throw new Error(`${label} returned HTTP ${response.status}`);
      }

      return parse(await response.json());
    },
  };
};
