import Link from "next/link";
import { ChevronRight, Dumbbell } from "lucide-react";
import { localHref, SectionHeading } from "@/components/landing/landing-shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function Programs({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  return (
    <section id="natacion" className="bg-[linear-gradient(180deg,#061327_0%,#0A2342_100%)] py-24 [content-visibility:auto] [contain-intrinsic-size:auto_1000px]">
      <div className="section-shell">
        <SectionHeading {...dictionary.programs} />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dictionary.programs.items.map((program) => (
            <div
              key={program.title}
              className="h-full"
            >
              <Link href={localHref(locale, program.href)} prefetch={false} className="group block h-full">
                <Card className="h-full overflow-hidden border-white/[0.12] bg-white/[0.06] p-1 text-swim-white shadow-lift transition hover:border-swim-cyan/40 hover:bg-white/[0.09]">
                  <CardHeader>
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-swim-cyan/[0.16] text-swim-cobalt">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-swim-white">{program.title}</CardTitle>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-swim-aqua">
                      {dictionary.nav.programs}
                      <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
