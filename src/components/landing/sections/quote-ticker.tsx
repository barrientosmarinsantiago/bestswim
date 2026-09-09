import { Waves } from "lucide-react";
import { landingServiceTicker } from "@/components/landing/landing-content";
import type { Locale } from "@/i18n/config";

export function QuoteTicker({ locale }: { locale: Locale }) {
  const ticker = landingServiceTicker[locale];
  const items = [...ticker.items, ...ticker.items, ...ticker.items];

  return (
    <section aria-label={ticker.label} className="relative overflow-hidden border-y border-swim-cyan/20 bg-swim-ink/80 py-4">
      <span className="sr-only">{ticker.items.join(". ")}</span>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-swim-ink to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-swim-ink to-transparent sm:w-28" />
      <div className="bestswim-marquee-track flex w-max items-center" style={{ animationDuration: "82s" }} aria-hidden="true">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="flex shrink-0 items-center gap-5 px-7 sm:px-10">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full border border-swim-cyan/30 bg-swim-cyan/10">
              <Waves className="h-4 w-4 text-swim-cyan" />
            </span>
            <p className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.1em] text-swim-white sm:text-base">
              {item}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
