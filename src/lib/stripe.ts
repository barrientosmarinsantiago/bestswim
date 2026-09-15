import { NextResponse } from "next/server";
import Stripe from "stripe";

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim().replace(/^["']|["']$/g, "");

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

  const code = stripeError?.code ?? stripeError?.type ?? "unknown";

  return NextResponse.json(
    {
      // El codigo va tambien dentro del texto: un navegador con el JS anterior en cache solo
      // muestra `error`, y sin el codigo el mensaje no permite diagnosticar nada.
      error: `Stripe rejected the request (${code}${stripeError?.param ? ` · ${stripeError.param}` : ""}).`,
      code,
      param: stripeError?.param
    },
    { status: 502 }
  );
}
