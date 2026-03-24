import { storage } from "wxt/utils/storage";

import type {
  InteractionEvent,
  InteractionEventInput,
} from "../types/events.js";

const EVENT_HISTORY_STORAGE_KEY_PREFIX = "event-history:";
const EVENT_HISTORY_STORAGE_KEY = `local:${EVENT_HISTORY_STORAGE_KEY_PREFIX}`;

let eventSequence = 0;

function createEventInstanceId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
}

const eventInstanceId = createEventInstanceId();

function getEventSequence(storageKey: string): number {
  const separatorIndex = storageKey.lastIndexOf(":");

  if (separatorIndex === -1) {
    return Number.NaN;
  }

  return Number.parseInt(storageKey.slice(separatorIndex + 1), 10);
}

export async function readEvents(): Promise<InteractionEvent[]> {
  const snapshot = await storage.snapshot("local");

  return Object.entries(snapshot)
    .filter(([key]) => key.startsWith(EVENT_HISTORY_STORAGE_KEY_PREFIX))
    .map(([key, value]) => ({ key, value: value as InteractionEvent }))
    .sort((left, right) => {
      if (left.value.timestamp !== right.value.timestamp) {
        return left.value.timestamp - right.value.timestamp;
      }

      const sequenceDifference =
        getEventSequence(left.key) - getEventSequence(right.key);

      if (sequenceDifference !== 0) {
        return sequenceDifference;
      }

      return left.key.localeCompare(right.key);
    })
    .map(({ value }) => value);
}

export async function recordEvent(event: InteractionEventInput): Promise<void> {
  const timestamp = Date.now();
  const storageKey: `local:${string}` =
    `${EVENT_HISTORY_STORAGE_KEY}${timestamp}:${eventInstanceId}:${eventSequence++}`;

  await storage.setItem(storageKey, {
    ...event,
    timestamp,
  });
}
