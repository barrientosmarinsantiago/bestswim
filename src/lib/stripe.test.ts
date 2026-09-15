import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import { stripeErrorResponse } from "./stripe";

describe("stripeErrorResponse", () => {
  it("devuelve JSON con code y param en vez de un 500 vacio", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Stripe.errors.StripeInvalidRequestError({
      type: "invalid_request_error",
      code: "resource_missing",
      param: "line_items[0][price]",
      message: "No such price: 'price_x'"
    });

    const response = stripeErrorResponse(error, "checkout");

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "Stripe rejected the request (resource_missing · line_items[0][price]).",
      code: "resource_missing",
      param: "line_items[0][price]"
    });
  });

  it("no expone el mensaje de un error que no es de Stripe", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = stripeErrorResponse(new Error("detalle interno"), "checkout");
    const body = await response.json();

    expect(body.code).toBe("unknown");
    expect(JSON.stringify(body)).not.toContain("detalle interno");
  });
});
