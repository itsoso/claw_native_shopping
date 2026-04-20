import { fetchPriceHistory } from "../src/parsers/fetchPriceHistory.js";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    (
      message: unknown,
      _sender: browser.runtime.MessageSender,
      sendResponse: (response: unknown) => void,
    ) => {
      if (
        typeof message === "object" &&
        message !== null &&
        "action" in message &&
        (message as { action: string }).action === "fetchPriceHistory" &&
        "skuId" in message
      ) {
        const skuId = (message as { skuId: string }).skuId;
        fetchPriceHistory(skuId)
          .then((data) => sendResponse({ success: true, data }))
          .catch(() => sendResponse({ success: false, data: null }));
        return true;
      }
      return false;
    },
  );
});
