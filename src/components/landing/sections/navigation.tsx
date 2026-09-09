"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Globe2, Menu, User, Waves, X } from "lucide-react";
import { partnersCopy } from "@/components/landing/landing-content";
import { BestSwimmersCounter, languageLabels } from "@/components/landing/landing-shared";
import { Button } from "@/components/ui/button";
import { locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

const LazyAuthPortalLink = lazy(() =>
  import("@/components/landing/auth-portal-link").then((module) => ({ default: module.AuthPortalLink }))
);

function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function localizedPath(nextLocale: Locale) {
    if (!pathname) {
      return `/${nextLocale}`;
    }

    const pathWithoutLocale = pathname.replace(/^\/(es|en|pt)(?=\/|$)/, "") || "";
    return `/${nextLocale}${pathWithoutLocale}`;
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <Globe2 className="h-4 w-4" />
        {languageLabels[locale]}
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </Button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-lg border border-white/10 bg-swim-ink/95 p-1 shadow-lift backdrop-blur-xl">
          {locales.map((option) => (
            <Link
              key={option}
              href={localizedPath(option)}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium text-swim-steel transition hover:bg-white/[0.07] hover:text-swim-cyan",
                option === locale && "bg-swim-cyan/[0.12] text-swim-white"
              )}
            >
              {languageLabels[option]}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AuthPortalFallback({ dictionary, locale, onNavigate }: { dictionary: Dictionary; locale: Locale; onNavigate?: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" asChild>
        <Link href={`/${locale}/clientes`} onClick={onNavigate} title={dictionary.nav.portal}>
          <User className="h-4 w-4" />
          {dictionary.nav.portal}
        </Link>
      </Button>
    </div>
  );
}

function AuthPortalSlot({ dictionary, locale, onNavigate }: { dictionary: Dictionary; locale: Locale; onNavigate?: () => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setReady(true), 900);

    return () => window.clearTimeout(timeout);
  }, []);

  if (!ready) {
    return <AuthPortalFallback dictionary={dictionary} locale={locale} onNavigate={onNavigate} />;
  }

  return (
    <Suspense fallback={<AuthPortalFallback dictionary={dictionary} locale={locale} onNavigate={onNavigate} />}>
      <LazyAuthPortalLink dictionary={dictionary} locale={locale} onNavigate={onNavigate} />
    </Suspense>
  );
}

function MoreMenu({ items }: { items: ReadonlyArray<readonly [string, string]> }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        Más
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </Button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border border-white/10 bg-swim-ink/95 p-1 shadow-lift backdrop-blur-xl">
          {items.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-swim-steel transition hover:bg-white/[0.07] hover:text-swim-cyan"
            >
              {label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Navigation({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const navItems = [
    ["#natacion", dictionary.nav.programs],
    ["#desafios", dictionary.nav.challenges],
    ["#historias", dictionary.nav.stories],
    ["#tienda", dictionary.nav.shop],
    ["#swim-camps", dictionary.nav.camps],
    ["#entrenador", dictionary.nav.coach],
    ["#membresia", dictionary.nav.pricing],
    ["#partners", partnersCopy[locale].title]
  ] as const;

  const primaryHrefs = ["#natacion", "#desafios", "#historias", "#membresia"];
  const primaryNavItems = navItems.filter(([href]) => primaryHrefs.includes(href));
  const moreNavItems = navItems.filter(([href]) => !primaryHrefs.includes(href));

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-swim-navy/95">
      <div className="section-shell flex h-[72px] items-center justify-between py-4">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md border border-swim-cyan/[0.35] bg-swim-cyan/[0.12]">
            <Waves className="h-5 w-5 text-swim-cyan" />
          </span>
          <span className="text-lg font-semibold tracking-normal text-swim-white">Best Swim</span>
        </Link>

        <div className="flex items-center gap-2 lg:gap-3">
          <nav className="hidden items-center gap-1 lg:flex">
            {primaryNavItems.map(([href, label]) => (
              <Button key={href} variant="ghost" size="sm" asChild>
                <a href={href}>{label}</a>
              </Button>
            ))}
            <MoreMenu items={moreNavItems} />
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <BestSwimmersCounter />
            <LanguageSwitch locale={locale} />
            <AuthPortalSlot dictionary={dictionary} locale={locale} />
          </div>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-swim-navy/[0.96] p-5 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Best Swim</span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-10 grid gap-2">
            <BestSwimmersCounter mobile />
            {navItems.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-md border border-white/10 bg-white/[0.06] px-4 py-4 text-lg font-medium"
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="rounded-md border border-swim-cyan/40 bg-swim-cyan/[0.12] px-2 py-2">
              <AuthPortalSlot dictionary={dictionary} locale={locale} onNavigate={() => setOpen(false)} />
            </div>
            <LanguageSwitch locale={locale} />
          </nav>
        </div>
      ) : null}
    </header>
  );
}
