import { ExternalLink } from "lucide-react";
import {
  bodyFactoryPartnerLogo,
  bodyFactoryPartnerUrl,
  partnersCopy,
  threeStylePartnerLogo,
  threeStylePartnerUrl
} from "@/components/landing/landing-content";
import { SectionHeading } from "@/components/landing/landing-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function Partners({ locale }: { locale: Locale }) {
  const copy = partnersCopy[locale];
  const partners = [
    {
      logo: bodyFactoryPartnerLogo,
      name: copy.bodyFactoryName,
      type: copy.bodyFactoryType,
      meta: "",
      url: bodyFactoryPartnerUrl
    },
    {
      logo: threeStylePartnerLogo,
      name: copy.threeStyleName,
      type: copy.threeStyleType,
      meta: copy.threeStyleMeta,
      url: threeStylePartnerUrl
    }
  ];

  return (
    <section id="partners" className="bg-[linear-gradient(180deg,#092A4C_0%,#041225_100%)] py-24 [content-visibility:auto] [contain-intrinsic-size:auto_900px]">
      <div className="section-shell">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {partners.map((partner) => (
            <article
              key={partner.name}
              className="flex h-full flex-col justify-between rounded-lg border border-white/[0.12] bg-white/[0.06] p-5 text-swim-white shadow-lift"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className="grid aspect-[4/3] w-full place-items-center rounded-md border border-white/10 bg-white p-4 sm:w-48">
                  <img src={partner.logo} alt={partner.name} loading="lazy" decoding="async" className="max-h-32 w-full object-contain" />
                </span>
                <div>
                  {partner.type ? <Badge>{partner.type}</Badge> : null}
                  <h2 className={cn("text-2xl font-semibold text-swim-white", partner.type && "mt-3")}>
                    <span className="block">{partner.name}</span>
                    {partner.meta ? <span className="mt-1 block">{partner.meta}</span> : null}
                  </h2>
                </div>
              </div>
              <Button asChild variant="secondary" className="mt-6 w-fit">
                <a href={partner.url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                {copy.cta}
                </a>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
