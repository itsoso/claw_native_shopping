const paymentAccessAllowList = new Set(["checkout"]);
const orderStateAllowList = new Set(["orchestrator"]);

export const canModuleAccessPayment = (moduleName: string): boolean =>
  paymentAccessAllowList.has(moduleName);

export const canModuleChangeOrderState = (moduleName: string): boolean =>
  orderStateAllowList.has(moduleName);

export const requiresAuditEvent = (status: string): boolean => status === "orderCommitted";
