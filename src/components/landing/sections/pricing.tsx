import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SectionHeading } from "@/components/landing/landing-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function Pricing({
  dictionary,
  locale,
  priceLabels
}: {
  dictionary: Dictionary;
  locale: Locale;
  priceLabels: { weekly: string; monthly: string; annual: string };
}) {
  const premiumPlans = [
    {
      plan: "monthly" as const,
      name: dictionary.pricing.monthly,
      price: priceLabels.monthly,
      badge: null,
      features: dictionary.pricing.features
    },
    {
      plan: "annual" as const,
      name: dictionary.pricing.annual,
      price: priceLabels.annual,
      badge: dictionary.pricing.annualBadge,
      features: dictionary.pricing.annualFeatures
    }
  ];
  const weeklyPass = dictionary.pricing.weeklyPass;

  return (
    <section id="membresia" className="relative overflow-hidden bg-[linear-gradient(180deg,#071A32_0%,#0B3156_100%)] py-24 [content-visibility:auto] [contain-intrinsic-size:auto_1200px]">
      <div className="absolute inset-0 bg-grid-lines bg-[length:42px_42px] opacity-[0.42]" />
      <div className="section-shell relative">
        <SectionHeading {...dictionary.pricing} />
        <div className="mt-10 grid gap-4 pt-4 lg:grid-cols-3">
          <Card className="flex h-full flex-col border-swim-ink/15 bg-swim-ink p-1 text-swim-white shadow-[0_22px_60px_rgba(2,10,24,0.18)]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-swim-white">{weeklyPass.name}</CardTitle>
                <Badge>{weeklyPass.badge}</Badge>
              </div>
              <p className="text-3xl font-semibold text-swim-white">{priceLabels.weekly}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-5">
              <ul className="flex-1 space-y-3">
                {weeklyPass.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-6 text-swim-white/[0.78]">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-swim-mint" />
                    {feature}
                  </li>
                ))}
              </ul>
              <CardDescription className="border-t border-white/10 pt-4 text-xs">{weeklyPass.note}</CardDescription>
              <Button asChild className="w-full">
                <Link href={`/${locale}/clientes?access=weekly`}>
                  <ArrowRight className="h-4 w-4" />
                  {weeklyPass.cta}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {premiumPlans.map((plan) => (
            <Card
              key={plan.plan}
              className={cn(
                "relative flex h-full overflow-visible flex-col border-swim-ink/15 bg-swim-ink p-1 text-swim-white shadow-[0_22px_60px_rgba(2,10,24,0.18)]",
                plan.plan === "annual" && "border-swim-cyan/[0.6] shadow-[0_0_42px_rgba(24,216,255,0.16)]"
              )}
            >
              {plan.badge ? <BestValueSeal /> : null}
              <CardHeader className={cn(plan.plan === "annual" && "pr-24 sm:pr-28")}>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-swim-white">{plan.name}</CardTitle>
                </div>
                <p className="text-3xl font-semibold text-swim-cyan">{plan.price}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-5">
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6 text-swim-white/[0.78]">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-swim-cyan" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href={`/${locale}/clientes?access=${plan.plan}`}>
                    <ArrowRight className="h-4 w-4" />
                    {dictionary.pricing.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function BestValueSeal() {
  return (
    <div
      aria-label="Best value, best deal"
      className="pointer-events-none absolute -right-3 -top-7 z-20 h-24 w-24 rounded-full bg-swim-cyan text-swim-navy shadow-[0_16px_45px_rgba(24,216,255,0.42)] ring-2 ring-swim-cyan/70 ring-offset-2 ring-offset-swim-ink sm:-right-5 sm:-top-8 sm:h-28 sm:w-28"
    >
      <svg className="bestswim-value-seal-text absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <path id="bestswim-value-seal-circle" d="M 50 50 m -39 0 a 39 39 0 1 1 78 0 a 39 39 0 1 1 -78 0" />
        </defs>
        <text className="fill-swim-navy text-[8px] font-black uppercase tracking-[0.24em]">
          <textPath href="#bestswim-value-seal-circle" startOffset="0%">
            BEST DEAL • BEST DEAL • BEST DEAL •
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-4 grid place-items-center rounded-full border border-swim-navy/20 bg-swim-cyan shadow-[inset_0_0_20px_rgba(255,255,255,0.35)]">
        <span className="text-center text-[15px] font-black uppercase leading-[0.92] tracking-normal sm:text-[17px]">
          <span className="block">BEST</span>
          <span className="block">VALUE</span>
        </span>
      </div>
    </div>
  );
}
