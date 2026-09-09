"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch } from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export const languageLabels: Record<Locale, string> = {
  es: "Español",
  en: "English",
  pt: "Português"
};

export function localHref(locale: Locale, href: string) {
  if (href.startsWith("#")) {
    return href;
  }

  return `/${locale}${href}`;
}

export function useElementInView<T extends HTMLElement>(rootMargin = "180px 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const timeout = globalThis.setTimeout(() => setInView(true), 0);

      return () => globalThis.clearTimeout(timeout);
    }

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { rootMargin, threshold: 0.01 });

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, inView] as const;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark"
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
}) {
  const isLight = tone === "light";

  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <Badge className={cn(isLight && "border-swim-cobalt/20 bg-swim-cobalt/10 text-swim-cobalt")}>{eyebrow}</Badge>
      {title ? (
        <h2
          className={cn(
            "mt-5 text-3xl font-semibold tracking-normal sm:text-4xl lg:text-5xl text-balance",
            isLight ? "text-swim-ink" : "text-swim-white"
          )}
        >
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className={cn("mt-5 text-base leading-7 sm:text-lg", isLight ? "text-[#38506d]" : "text-swim-steel")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function RailIndicator({
  count,
  activeIndex,
  onSelect,
  label,
  tone = "dark"
}: {
  count: number;
  activeIndex: number;
  onSelect: Dispatch<number>;
  label: string;
  tone?: "dark" | "light";
}) {
  const isLight = tone === "light";

  return (
    <div className="mt-6 flex justify-center">
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-2",
          isLight ? "border-swim-ink/10 bg-swim-ink/[0.06]" : "border-white/10 bg-white/[0.045]"
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`${label} ${index + 1}`}
            aria-current={activeIndex === index ? "true" : undefined}
            className="group grid h-5 place-items-center"
          >
            <span
              className={cn(
                "block h-1.5 rounded-full transition-[width,background-color] duration-300",
                activeIndex === index
                  ? "bg-swim-cyan"
                  : isLight
                    ? "bg-swim-ink/25 group-hover:bg-swim-ink/45"
                    : "bg-white/25 group-hover:bg-white/45"
              )}
              style={{ width: activeIndex === index ? 28 : 7 }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function scrollRailItemIntoView(container: HTMLElement | null, item: HTMLElement | null) {
  if (!container || !item) {
    return;
  }

  const left = item.offsetLeft - (container.clientWidth - item.clientWidth) / 2;
  container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
}

type BestSwimmersCounterResponse = {
  count?: number;
};

export function BestSwimmersCounter({ mobile = false }: { mobile?: boolean }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCount() {
      try {
        const response = await fetch("/api/public/best-swimmers");

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as BestSwimmersCounterResponse;

        if (mounted && typeof payload.count === "number") {
          setCount(payload.count);
        }
      } catch {
        // Keep the header quiet if the aggregate is temporarily unavailable.
      }
    }

    loadCount();
    const interval = window.setInterval(loadCount, 300_000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-swim-cyan/30 bg-swim-cyan/[0.12] font-semibold text-swim-white",
        mobile ? "min-h-10 w-full justify-between gap-2 px-3 py-2 text-sm" : "w-fit gap-2 px-3 py-1.5 text-xs leading-none"
      )}
      aria-live="polite"
    >
      <span className={cn("inline-flex items-center", mobile ? "gap-2" : "gap-1.5")}>
        <Users className={cn("text-swim-cyan", mobile ? "h-4 w-4" : "h-3.5 w-3.5")} />
        Comunidad
      </span>
      <span className={cn("rounded-md bg-swim-cyan text-center font-semibold text-swim-navy", mobile ? "min-w-8 px-2 py-1 text-sm" : "min-w-7 px-2 py-0.5 text-xs")}>
        {count ?? "..."}
      </span>
    </div>
  );
}
