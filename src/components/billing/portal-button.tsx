"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";

export function PortalButton({ locale, label }: { locale: Locale; label: string }) {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);

    const response = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale })
    });
    const data = (await response.json()) as { url?: string };

    if (data.url) {
      window.location.assign(data.url);
      return;
    }

    setLoading(false);
  }

  return (
    <Button variant="secondary" onClick={openPortal} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
      {label}
    </Button>
  );
}
