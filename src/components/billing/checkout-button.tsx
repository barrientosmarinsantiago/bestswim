"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { BillingPlan } from "@/lib/pricing";

export function CheckoutButton({
  locale,
  plan,
  children,
  className
}: {
  locale: Locale;
  plan: BillingPlan;
  children: ReactNode;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, locale })
      });
      // Se lee como texto: si el servidor responde sin cuerpo (un 502 del proxy, por
      // ejemplo), `response.json()` lanza "Unexpected end of JSON input" y tapa el estado.
      const raw = await response.text();
      let data: { url?: string; error?: string; code?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        // Cuerpo no JSON: se informa con el codigo HTTP.
      }

      if (!response.ok || !data.url) {
        // El servidor ya incluye el codigo de Stripe en `error`; el HTTP solo hace falta
        // cuando no llega cuerpo.
        throw new Error(data.error || `Checkout failed (HTTP ${response.status}).`);
      }

      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button className={className} onClick={startCheckout} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        {children}
      </Button>
      {error ? <p className="text-xs text-swim-aqua/80">{error}</p> : null}
    </div>
  );
}
