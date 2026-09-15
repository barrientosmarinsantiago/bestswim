import { describe, expect, it } from "vitest";
import { getInvoiceSubscriptionId } from "./stripe-webhook";

describe("getInvoiceSubscriptionId", () => {
  it("lee la forma anterior a 2025-03-31 (invoice.subscription)", () => {
    expect(getInvoiceSubscriptionId({ subscription: "sub_old" })).toBe("sub_old");
    expect(getInvoiceSubscriptionId({ subscription: { id: "sub_old_obj" } })).toBe("sub_old_obj");
  });

  it("lee la forma de las versiones 2025+ y 2026 (invoice.parent)", () => {
    const invoice = { parent: { subscription_details: { subscription: "sub_new" } } };
    expect(getInvoiceSubscriptionId(invoice)).toBe("sub_new");
  });

  it("devuelve undefined en facturas sin suscripcion", () => {
    expect(getInvoiceSubscriptionId({})).toBeUndefined();
    expect(getInvoiceSubscriptionId({ subscription: null, parent: null })).toBeUndefined();
    expect(getInvoiceSubscriptionId({ parent: { subscription_details: null } })).toBeUndefined();
  });
});
