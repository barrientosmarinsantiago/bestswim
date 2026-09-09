"use client";

import { defaultLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { Navigation } from "@/components/landing/sections/navigation";
import { Hero } from "@/components/landing/sections/hero";
import { FloatingContactActions } from "@/components/landing/sections/floating-contact-actions";
import { QuoteTicker } from "@/components/landing/sections/quote-ticker";
import { Programs } from "@/components/landing/sections/programs";
import { Challenges } from "@/components/landing/sections/challenges";
import { Pricing } from "@/components/landing/sections/pricing";
import { Stories } from "@/components/landing/sections/stories";
import { ShopCampsCoach } from "@/components/landing/sections/shop-camps-coach";
import { Partners } from "@/components/landing/sections/partners";
import { Footer } from "@/components/landing/sections/footer";

export function LandingPage({
  dictionary,
  locale,
  priceLabels
}: {
  dictionary: Dictionary;
  locale: Locale;
  priceLabels: { weekly: string; monthly: string; annual: string };
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-swim-navy text-swim-white">
      <Navigation dictionary={dictionary} locale={locale || defaultLocale} />
      <FloatingContactActions dictionary={dictionary} />
      <Hero dictionary={dictionary} locale={locale} />
      <QuoteTicker locale={locale} />
      <Programs dictionary={dictionary} locale={locale} />
      <Challenges dictionary={dictionary} locale={locale} />
      <Pricing dictionary={dictionary} locale={locale} priceLabels={priceLabels} />
      <Stories dictionary={dictionary} />
      <ShopCampsCoach dictionary={dictionary} locale={locale} />
      <Partners locale={locale} />
      <Footer dictionary={dictionary} locale={locale} />
    </main>
  );
}
