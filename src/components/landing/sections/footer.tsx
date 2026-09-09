"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Settings2, Waves } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function Footer({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="border-t border-white/10 bg-swim-navy py-10">
      <div className="section-shell grid gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <div className="flex items-center gap-3">
            <Waves className="h-6 w-6 text-swim-cyan" />
            <span className="text-lg font-semibold">Best Swim</span>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-swim-steel">{dictionary.footer.tagline}</p>
        </div>
        <div className="grid gap-2 text-sm text-swim-steel">
          <Link className="hover:text-swim-cyan" href={`/${locale}/politica-de-privacidad`}>
            {dictionary.footer.privacy}
          </Link>
          <Link className="hover:text-swim-cyan" href={`/${locale}/politica-de-cookies`}>
            {dictionary.footer.cookies}
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-left hover:text-swim-cyan"
            onClick={() => window.dispatchEvent(new Event("bestswim:open-cookie-preferences"))}
          >
            <Settings2 className="h-4 w-4" />
            {dictionary.footer.cookiePreferences}
          </button>
          <Link className="hover:text-swim-cyan" href={`/${locale}/clientes`}>
            {dictionary.nav.portal}
          </Link>
        </div>
      </div>
      <div className="section-shell mt-8 border-t border-white/10 pt-6 text-sm text-swim-steel">
        © {year} Best Swim.
      </div>
    </footer>
  );
}
