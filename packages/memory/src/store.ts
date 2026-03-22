import type { AuditEvent, AuditLogPort } from "./audit-log.js";

export type OrderSnapshot = {
  orderId: string;
  status: string;
  [key: string]: unknown;
};

export type MemoryStore = AuditLogPort & {
  setOrderSnapshot(snapshot: OrderSnapshot): void;
  getOrderSnapshot(orderId: string): OrderSnapshot | undefined;
};

export const createMemoryStore = (): MemoryStore => {
  const auditEvents = new Map<string, AuditEvent[]>();
  const orderSnapshots = new Map<string, OrderSnapshot>();

  return {
    appendAuditEvent(orderId, event) {
      const events = auditEvents.get(orderId) ?? [];
      events.push(event);
      auditEvents.set(orderId, events);
    },
    getAuditEvents(orderId) {
      return [...(auditEvents.get(orderId) ?? [])];
    },
    setOrderSnapshot(snapshot) {
      orderSnapshots.set(snapshot.orderId, snapshot);
    },
    getOrderSnapshot(orderId) {
      return orderSnapshots.get(orderId);
    }
  };
};
