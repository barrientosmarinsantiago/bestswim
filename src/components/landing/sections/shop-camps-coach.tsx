"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { CalendarDays, Construction, ExternalLink, Heart, Info, ShoppingBag, X } from "lucide-react";
import { campGalleryImages } from "@/components/landing/landing-content";
import { RailIndicator, scrollRailItemIntoView, SectionHeading, useElementInView } from "@/components/landing/landing-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function ShopCampsCoach({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const [campInfoOpen, setCampInfoOpen] = useState(false);
  const [campInterestState, setCampInterestState] = useState<"idle" | "submitting" | "success" | "auth" | "error">("idle");
  const [activeCampImage, setActiveCampImage] = useState(0);
  const [campSectionRef, campSectionInView] = useElementInView<HTMLElement>();
  const campRailRef = useRef<HTMLDivElement | null>(null);
  const campImageRefs = useRef<Array<HTMLDivElement | null>>([]);

  function selectCampImage(index: number) {
    const nextIndex = (index + campGalleryImages.length) % campGalleryImages.length;
    setActiveCampImage(nextIndex);
    scrollRailItemIntoView(campRailRef.current, campImageRefs.current[nextIndex]);
  }

  useEffect(() => {
    if (!campSectionInView) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveCampImage((current) => {
        const nextIndex = (current + 1) % campGalleryImages.length;
        requestAnimationFrame(() => {
          scrollRailItemIntoView(campRailRef.current, campImageRefs.current[nextIndex]);
        });
        return nextIndex;
      });
    }, 4200);

    return () => window.clearInterval(interval);
  }, [campSectionInView]);

  useEffect(() => {
    if (!campInfoOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [campInfoOpen]);

  async function submitCampInterest() {
    setCampInterestState("submitting");

    try {
      const response = await fetch("/api/swim-camps/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale })
      });

      if (response.status === 401) {
        setCampInterestState("auth");
        return;
      }

      setCampInterestState(response.ok ? "success" : "error");
    } catch {
      setCampInterestState("error");
    }
  }

  return (
    <>
      <section
        id="tienda"
        className="bg-[linear-gradient(180deg,#0B3156_0%,#061327_100%)] py-24 [contain-intrinsic-size:720px] [content-visibility:auto]"
      >
        <div className="section-shell grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="space-y-5">
            <Badge>{dictionary.shop.eyebrow}</Badge>
            <div className="inline-flex max-w-xl items-center gap-3 rounded-md border border-swim-cyan/25 bg-swim-cyan/[0.08] px-4 py-3 text-swim-white">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-md border border-swim-cyan/30 bg-swim-cyan/10">
                <Construction className="h-5 w-5 text-swim-cyan" />
              </span>
              <h2 className="text-lg font-semibold leading-snug sm:text-xl">{dictionary.shop.title}</h2>
            </div>
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-swim-cyan">{dictionary.shop.catalogLabel}</p>
                <p className="mt-1 text-sm text-swim-steel">
                  {dictionary.shop.items.length} {dictionary.shop.itemsLabel}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {dictionary.shop.items.map((item) => (
              <article
                key={item}
                className="group flex min-h-48 flex-col rounded-md border border-white/10 bg-white/[0.055] p-3 transition hover:border-swim-cyan/50 hover:bg-swim-cyan/[0.075]"
              >
                <div className="grid h-24 place-items-center rounded-md border border-white/10 bg-swim-ink/70">
                  <ShoppingBag className="h-8 w-8 text-swim-cyan transition group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col pt-4">
                  <h3 className="min-h-12 text-base font-semibold leading-6 text-swim-white">{item}</h3>
                </div>
              </article>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section
        ref={campSectionRef}
        id="swim-camps"
        className="bg-[radial-gradient(circle_at_80%_0%,rgba(24,216,255,0.14),transparent_30rem),linear-gradient(180deg,#061327_0%,#020A18_100%)] py-24 [contain-intrinsic-size:1100px] [content-visibility:auto]"
      >
        <div className="section-shell grid gap-10 lg:grid-cols-2 lg:items-stretch">
          <div className="flex h-full flex-col">
            <SectionHeading {...dictionary.camps} />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="secondary" onClick={submitCampInterest} disabled={campInterestState === "submitting"}>
                <Heart className="h-5 w-5" />
                {dictionary.camps.interestCta}
              </Button>
              <Button type="button" variant="primary" onClick={() => setCampInfoOpen(true)}>
                <Info className="h-5 w-5" />
                {dictionary.camps.infoCta}
              </Button>
            </div>

            <div className="mt-3 min-h-6 text-sm text-swim-steel">
              {campInterestState === "success" ? <span className="text-swim-aqua">{dictionary.camps.interestSuccess}</span> : null}
              {campInterestState === "auth" ? (
                <span>
                  {dictionary.camps.interestLogin}{" "}
                  <Link href={`/${locale}/clientes`} className="font-semibold text-swim-cyan underline-offset-4 hover:underline">
                    {dictionary.nav.portal}
                  </Link>
                </span>
              ) : null}
              {campInterestState === "error" ? <span className="text-swim-aqua">{dictionary.camps.interestError}</span> : null}
            </div>

            <div className="mt-8">
              <p className="mb-4 text-sm uppercase tracking-[0.18em] text-swim-steel">{dictionary.camps.galleryLabel}</p>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#061327] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#020A18] to-transparent" />
                <div ref={campRailRef} className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {campGalleryImages.map((image, index) => (
                    <div
                      key={image}
                      ref={(node) => {
                        campImageRefs.current[index] = node;
                      }}
                      className="w-[230px] flex-none snap-center sm:w-[270px]"
                    >
                      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] p-1">
                        <img
                          src={image}
                          alt={`${dictionary.camps.galleryLabel} ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[4/3] w-full rounded-md object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <RailIndicator count={campGalleryImages.length} activeIndex={activeCampImage} onSelect={selectCampImage} label={dictionary.camps.galleryLabel} />
              </div>
            </div>
          </div>
          <div className="glass-panel flex h-full min-h-[620px] flex-col overflow-hidden rounded-lg p-3 sm:min-h-[680px] lg:min-h-0">
            <div className="rounded-md border border-white/10 bg-swim-ink/80 p-4">
              <h3 className="text-balance text-2xl font-semibold leading-tight text-swim-white sm:text-3xl">
                {dictionary.camps.featureTitle}
              </h3>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-swim-cyan">{dictionary.camps.featureDate}</p>
            </div>
            <div className="mt-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-md bg-swim-ink/70">
              <img
                src={dictionary.images.camp}
                alt={dictionary.camps.featureTitle}
                loading="lazy"
                decoding="async"
                className="h-full max-h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {campInfoOpen ? (
        <div
          className="fixed inset-0 z-[80] grid animate-[bestswim-modal-fade_0.2s_ease-out] place-items-center bg-swim-navy/[0.86] p-4 backdrop-blur-xl"
          onClick={() => setCampInfoOpen(false)}
        >
          <div
              role="dialog"
              aria-modal="true"
              aria-label={dictionary.camps.infoTitle}
              className="relative w-full max-w-3xl animate-[bestswim-modal-rise_0.22s_ease-out] overflow-hidden rounded-lg border border-white/10 bg-swim-ink p-5 shadow-lift"
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-5 top-5 z-10"
                onClick={() => setCampInfoOpen(false)}
                aria-label="Cerrar información"
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="pr-12">
                <Badge>{dictionary.camps.eventSource}</Badge>
                <h3 className="mt-5 text-3xl font-semibold text-swim-white">{dictionary.camps.infoTitle}</h3>
                <p className="mt-4 leading-7 text-swim-steel">{dictionary.camps.infoDescription}</p>
              </div>
              <div className="mt-6 grid gap-3">
                {dictionary.camps.infoItems.map((item) => (
                  <div key={item.label} className="rounded-md border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-swim-cyan" />
                      <p className="font-semibold text-swim-white">{item.label}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-swim-steel">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="secondary">
                  <a href={dictionary.camps.officialLink} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    {dictionary.camps.officialCta}
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <a href={dictionary.camps.registrationsLink} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    {dictionary.camps.registrationsCta}
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <a href={dictionary.camps.technicalLink} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    {dictionary.camps.technicalCta}
                  </a>
                </Button>
              </div>
          </div>
        </div>
      ) : null}

      <section id="entrenador" className="bg-[linear-gradient(180deg,#020A18_0%,#061327_100%)] py-24">
        <div className="section-shell grid gap-10 lg:grid-cols-[420px_1fr] lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/[0.12] bg-white/[0.07]">
            <NextImage
              src={dictionary.images.coach}
              alt={dictionary.coach.title}
              fill
              sizes="(max-width: 1024px) 100vw, 420px"
              className="object-cover object-center"
            />
          </div>
          <div>
            <SectionHeading {...dictionary.coach} />
            <div className="mt-8 space-y-5 text-base leading-8 text-swim-steel sm:text-lg">
              {dictionary.coach.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
