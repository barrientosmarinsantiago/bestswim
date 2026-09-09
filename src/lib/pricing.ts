// `weekly` es un pase de 7 días de pago único (1 €), no una suscripción: sustituye al
// antiguo trial gratuito de 15 días. Se modela como plan de facturación y no como un
// flag de "trial" porque pasa por el mismo checkout que los otros dos, y así el webhook
// de Stripe no necesita una rama aparte para conceder acceso.
export type BillingPlan = "weekly" | "monthly" | "annual";

/** Los planes que crean una suscripción recurrente. El semanal se cobra una sola vez. */
export const RECURRING_PLANS: readonly BillingPlan[] = ["monthly", "annual"];

export function isRecurringPlan(plan: BillingPlan) {
  return RECURRING_PLANS.includes(plan);
}

export function getPriceLabel(plan: BillingPlan, fallback: string) {
  if (plan === "weekly") {
    return process.env.NEXT_PUBLIC_WEEKLY_PRICE_LABEL || fallback;
  }

  if (plan === "monthly") {
    return process.env.NEXT_PUBLIC_MONTHLY_PRICE_LABEL || fallback;
  }

  return process.env.NEXT_PUBLIC_ANNUAL_PRICE_LABEL || fallback;
}
