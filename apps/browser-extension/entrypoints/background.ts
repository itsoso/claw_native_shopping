import { checkPriceAlerts, handleNotificationClick, updateBadge } from "../src/background/priceAlertWorker.js";
import {
  checkPriceGuards,
  handlePriceGuardClick,
} from "../src/background/priceGuardWorker.js";
import { fetchPriceHistory, fetchPriceHistoryBatch } from "../src/parsers/fetchPriceHistory.js";
import {
  addPriceAlert,
  readPriceAlerts,
  removePriceAlert,
} from "../src/storage/priceAlerts.js";
import type { PriceAlertInput } from "../src/types/priceAlert.js";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    void browser.alarms.create("price-check", { periodInMinutes: 240 });
    void browser.alarms.create("price-guard", { periodInMinutes: 360 });
    void updateBadge();
  });

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "price-check") {
      void checkPriceAlerts();
    }
    if (alarm.name === "price-guard") {
      void checkPriceGuards();
    }
  });

  browser.notifications.onClicked.addListener((notificationId: string) => {
    if (notificationId.startsWith("price-guard-")) {
      handlePriceGuardClick(notificationId);
      return;
    }
    handleNotificationClick(notificationId);
  });

  browser.runtime.onMessage.addListener(
    (
      message: unknown,
      _sender: browser.runtime.MessageSender,
      sendResponse: (response: unknown) => void,
    ) => {
      if (typeof message !== "object" || message === null || !("action" in message)) {
        return false;
      }

      const action = (message as { action: string }).action;

      if (action === "fetchPriceHistory" && "skuId" in message) {
        const skuId = (message as { skuId: string }).skuId;
        fetchPriceHistory(skuId)
          .then((data) => sendResponse({ success: true, data }))
          .catch(() => sendResponse({ success: false, data: null }));
        return true;
      }

      if (action === "fetchPriceHistoryBatch" && "skuIds" in message) {
        const skuIds = (message as { skuIds: string[] }).skuIds;
        fetchPriceHistoryBatch(skuIds)
          .then((data) => sendResponse({ success: true, data }))
          .catch(() => sendResponse({ success: false, data: {} }));
        return true;
      }

      if (action === "addPriceAlert" && "alert" in message) {
        const input = (message as { alert: PriceAlertInput }).alert;
        addPriceAlert(input)
          .then(() => updateBadge())
          .then(() => sendResponse({ success: true }))
          .catch(() => sendResponse({ success: false }));
        return true;
      }

      if (action === "removePriceAlert" && "skuId" in message) {
        const skuId = (message as { skuId: string }).skuId;
        removePriceAlert(skuId)
          .then(() => updateBadge())
          .then(() => sendResponse({ success: true }))
          .catch(() => sendResponse({ success: false }));
        return true;
      }

      if (action === "getPriceAlerts") {
        readPriceAlerts()
          .then((data) => sendResponse({ success: true, data }))
          .catch(() => sendResponse({ success: false, data: [] }));
        return true;
      }

      if (action === "clearBadge") {
        void browser.action.setBadgeText({ text: "" });
        sendResponse({ success: true });
        return false;
      }

      return false;
    },
  );
});
