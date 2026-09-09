"use client";

import Link from "next/link";
import { ArrowLeft, Waves } from "lucide-react";
import {
  getContentAccessLimit,
  getLockedContentVariant,
  LockedContentCard,
  type ContentAccessLevel
} from "@/components/content/content-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { multimediaDrills } from "@/content/multimedia";
import type { Locale } from "@/i18n/config";

export function MultimediaPage({
  locale,
  title,
  accessLevel
}: {
  locale: Locale;
  title: string;
  accessLevel: ContentAccessLevel;
}) {
  const accessLimit = getContentAccessLimit(accessLevel);
  const lockedVariant = getLockedContentVariant(accessLevel);

  return (
    <main className="min-h-screen bg-swim-navy px-4 py-10 text-swim-white">
      <div className="mx-auto max-w-6xl">
        <Button variant="secondary" asChild>
          <Link href={`/${locale}`}>
            <ArrowLeft className="h-4 w-4" />
            Best Swim
          </Link>
        </Button>

        <Card className="glass-panel mt-8">
          <CardHeader>
            <Waves className="mb-4 h-8 w-8 text-swim-cyan" />
            <CardTitle className="text-4xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {multimediaDrills.map((drill, index) =>
              lockedVariant && index >= accessLimit ? (
                <LockedContentCard key={drill.id} locale={locale} variant={lockedVariant} title={drill.title} summary={drill.description} />
              ) : (
                <article
                  key={drill.id}
                  className="grid gap-5 rounded-md border border-white/10 bg-white/[0.055] p-4 md:grid-cols-[280px_1fr] md:items-center"
                >
                  <div className="overflow-hidden rounded-md border border-swim-cyan/20 bg-swim-ink">
                    {drill.video ? (
                      <video
                        src={drill.video}
                        poster={drill.poster || undefined}
                        controls
                        preload="none"
                        playsInline
                        className="aspect-video h-full w-full bg-swim-ink object-contain"
                      />
                    ) : (
                      <div className="aspect-video bg-swim-ink/80" aria-hidden="true" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold text-swim-white">{drill.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-swim-steel">{drill.description}</p>
                  </div>
                </article>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
