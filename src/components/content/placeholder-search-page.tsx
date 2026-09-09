"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n/config";

const labels = {
  es: {
    searchPlaceholder: "Buscar sesión",
    noResults: "No se encontraron sesiones para"
  },
  en: {
    searchPlaceholder: "Search session",
    noResults: "No sessions found for"
  },
  pt: {
    searchPlaceholder: "Buscar sessão",
    noResults: "Não foram encontradas sessões para"
  }
} as const;

export function PlaceholderSearchPage({
  locale,
  title,
  body,
  footer
}: {
  locale: Locale;
  title: string;
  body: string;
  footer: string;
}) {
  const [query, setQuery] = useState("");
  const copy = labels[locale];

  return (
    <main className="min-h-screen bg-swim-navy px-4 py-10 text-swim-white">
      <div className="mx-auto max-w-5xl">
        <Button variant="secondary" asChild>
          <Link href={`/${locale}`}>
            <ArrowLeft className="h-4 w-4" />
            Best Swim
          </Link>
        </Button>
        <Card className="glass-panel mt-8">
          <CardHeader className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
            <div>
              <Waves className="mb-4 h-8 w-8 text-swim-cyan" />
              <CardTitle className="text-4xl">{title}</CardTitle>
            </div>
            <label className="relative lg:mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-swim-cyan" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="pl-10"
              />
            </label>
          </CardHeader>
          <CardContent>
            <p className="leading-7 text-swim-steel">{body}</p>
            <div className="mt-8 rounded-md border border-white/10 bg-white/[0.07] p-4 text-sm text-swim-steel">
              {query ? `${copy.noResults} "${query}".` : footer}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
