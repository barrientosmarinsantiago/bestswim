import Link from "next/link";
import { ArrowLeft, Waves } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LegalPageContent } from "@/content/legal";
import type { Locale } from "@/i18n/config";

export function LegalPage({ page, locale }: { page: LegalPageContent; locale: Locale }) {
  return (
    <main className="min-h-screen bg-swim-navy px-4 py-10 text-swim-white">
      <div className="mx-auto max-w-4xl">
        <Button variant="secondary" asChild>
          <Link href={`/${locale}`}>
            <ArrowLeft className="h-4 w-4" />
            Best Swim
          </Link>
        </Button>

        <article className="glass-panel mt-8 rounded-lg p-6 sm:p-8">
          <Badge>Best Swim</Badge>
          <Waves className="mt-6 h-9 w-9 text-swim-cyan" />
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-swim-white sm:text-5xl">{page.title}</h1>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.16em] text-swim-cyan">{page.updatedAt}</p>
          <p className="mt-5 max-w-3xl text-base leading-7 text-swim-steel sm:text-lg">{page.description}</p>

          <div className="mt-10 space-y-10">
            {page.sections.map((section) => (
              <section key={section.title} className="border-t border-white/10 pt-8">
                <h2 className="text-2xl font-semibold text-swim-white">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-4 leading-8 text-swim-steel">
                    {paragraph}
                  </p>
                ))}
                {section.items ? (
                  <ul className="mt-5 space-y-3 text-swim-steel">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 leading-7">
                        <span className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-swim-cyan" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
