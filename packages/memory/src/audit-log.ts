export type AuditEvent = {
  type: string;
  [key: string]: unknown;
};

export type AuditLogPort = {
  appendAuditEvent(orderId: string, event: AuditEvent): void;
  getAuditEvents(orderId: string): AuditEvent[];
};
