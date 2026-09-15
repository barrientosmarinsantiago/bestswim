import { NextResponse } from "next/server";
import Stripe from "stripe";

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey, {
    apiVersion: "2024-06-20"
  });
}

/**
 * Respuesta JSON para un fallo de Stripe dentro de una ruta de API.
 *
 * Sin esto, cualquier rechazo de Stripe (precio inexistente, precio recurrente en un pago
 * unico, clave de otro modo...) salia como excepcion sin capturar: Next responde 500 con el
 * cuerpo vacio y el navegador solo ve "Unexpected end of JSON input", que no dice nada.
 *
 * Al cliente van `code` y `param`, que identifican el problema sin exponer nada sensible;
 * el mensaje completo de Stripe queda en el log del servidor y en Desarrolladores → Registros.
 */
export function stripeErrorResponse(error: unknown, context: string) {
  const stripeError = error instanceof Stripe.errors.StripeError ? error : null;

  console.error(`[stripe:${context}]`, stripeError ? `${stripeError.type} ${stripeError.code ?? ""} ${stripeError.param ?? ""} — ${stripeError.message}` : error);

  return NextResponse.json(
    {
      error: "Stripe rejected the request.",
      code: stripeError?.code ?? stripeError?.type ?? "unknown",
      param: stripeError?.param
    },
    { status: 502 }
  );
}
