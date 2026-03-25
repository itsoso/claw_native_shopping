import { describe, expect, it } from "vitest";
import { buildServer, startApiServer } from "../../apps/api/src/server.js";

describe("buyer api", () => {
  it("can start a real HTTP listener", async () => {
    const { app, baseUrl } = await startApiServer({
      port: 0,
      host: "127.0.0.1"
    });

    try {
      const response = await fetch(`${baseUrl}/orders/missing-order/explanation`);
      expect(response.status).toBe(404);
    } finally {
      await app.close();
    }
  });

  it("responds to browser preflight requests for the demo web app", async () => {
    const app = buildServer();

    try {
      const response = await app.inject({
        method: "OPTIONS",
        url: "/intents/replenish",
        headers: {
          origin: "http://127.0.0.1:4174",
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type"
        }
      });

      expect(response.statusCode).toBe(204);
      expect(response.headers["access-control-allow-origin"]).toBe("*");
      expect(response.headers["access-control-allow-methods"]).toContain("POST");
      expect(response.headers["access-control-allow-headers"]).toContain("content-type");
    } finally {
      await app.close();
    }
  });

  it("persists and returns household replenishment metadata", async () => {
    const app = buildServer();

    try {
      const replenishResponse = await app.inject({
        method: "POST",
        url: "/intents/replenish",
        payload: {
          scenarioId: "home"
        }
      });

      expect(replenishResponse.statusCode).toBe(200);

      const replenish = replenishResponse.json() as { orderId: string; snapshot: { scenarioId: string } };
      expect(replenish.snapshot.scenarioId).toBe("home");

      const explanationResponse = await app.inject({
        method: "GET",
        url: `/orders/${replenish.orderId}/explanation`
      });

      expect(explanationResponse.statusCode).toBe(200);

      const explanation = explanationResponse.json() as {
        explanation: Array<{ type: string }>;
        snapshot: { status: string; scenarioId: string; category: string };
      };

      expect(explanation.explanation.map((event) => event.type)).toContain(
        "POLICY_EVALUATED"
      );
      expect(explanation.explanation.map((event) => event.type)).toContain(
        "ORDER_COMMITTED"
      );
      expect(explanation.snapshot.status).toBe("fulfillmentStarted");
      expect(explanation.snapshot.scenarioId).toBe("home");
      expect(explanation.snapshot.category).toBe("eggs");
    } finally {
      await app.close();
    }
  });

  it("supports office scenarios and approval-required demo runs", async () => {
    const app = buildServer();

    try {
      const officeResponse = await app.inject({
        method: "POST",
        url: "/intents/replenish",
        payload: {
          scenarioId: "office"
        }
      });

      expect(officeResponse.statusCode).toBe(200);

      const office = officeResponse.json() as {
        status: string;
        snapshot: { scenarioId: string; category: string };
      };
      expect(office.status).toBe("orderCommitted");
      expect(office.snapshot.scenarioId).toBe("office");
      expect(office.snapshot.category).toBe("coffee");

      const approvalResponse = await app.inject({
        method: "POST",
        url: "/intents/replenish",
        payload: {
          scenarioId: "office",
          demo: {
            forceApproval: true
          }
        }
      });

      expect(approvalResponse.statusCode).toBe(200);

      const approval = approvalResponse.json() as {
        status: string;
        reason: string;
        explanation: string[];
        snapshot: { status: string; scenarioId: string; category: string };
      };

      expect(approval.status).toBe("approvalRequired");
      expect(approval.reason).toBe("approval_required");
      expect(approval.explanation).toContain("APPROVAL_REQUIRED");
      expect(approval.snapshot.status).toBe("approvalWait");
      expect(approval.snapshot.scenarioId).toBe("office");
      expect(approval.snapshot.category).toBe("coffee");
    } finally {
      await app.close();
    }
  });
});
