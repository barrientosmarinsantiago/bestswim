type IdOrObject = string | { id: string } | null | undefined;

function toId(value: IdOrObject) {
  return typeof value === "string" ? value : value?.id;
}

/**
 * ID de la suscripcion de una factura, venga con la forma que venga.
 *
 * Hasta 2025-03-31 estaba en `invoice.subscription`; desde entonces en
 * `invoice.parent.subscription_details.subscription`. La factura no se re-pide por API
 * porque solo hace falta este ID, y leer las dos rutas cuesta menos que una llamada.
 */
export function getInvoiceSubscriptionId(object: unknown) {
  const invoice = object as {
    subscription?: IdOrObject;
    parent?: { subscription_details?: { subscription?: IdOrObject } | null } | null;
  };

  return toId(invoice.subscription) ?? toId(invoice.parent?.subscription_details?.subscription);
}
