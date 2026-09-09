"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { ArrowRight, Trophy } from "lucide-react";
import { BestSwimmersCounter, useElementInView } from "@/components/landing/landing-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function Hero({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const heroSlides = useMemo(
    () => (dictionary.images.heroSlides?.length ? [...dictionary.images.heroSlides] : [dictionary.images.hero]),
    [dictionary.images.hero, dictionary.images.heroSlides]
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [sectionRef, sectionInView] = useElementInView<HTMLElement>("0px 0px");

  useEffect(() => {
    if (heroSlides.length < 2 || !sectionInView) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [heroSlides.length, sectionInView]);

  useEffect(() => {
    if (heroSlides.length < 2 || !sectionInView) {
      return;
    }

    const nextImage = new Image();
    nextImage.src = heroSlides[(activeSlide + 1) % heroSlides.length];
  }, [activeSlide, heroSlides, sectionInView]);

  return (
    <section ref={sectionRef} id="inicio" className="relative min-h-[92vh] overflow-hidden bg-swim-navy pt-24">
      <div key={heroSlides[activeSlide]} className="absolute inset-0 animate-[bestswim-hero-fade_1.4s_ease-out]">
        <NextImage
          src={heroSlides[activeSlide]}
          alt=""
          aria-hidden
          fill
          priority={activeSlide === 0}
          sizes="100vw"
          className="scale-[1.03] object-cover opacity-35"
        />
        <NextImage
          src={heroSlides[activeSlide]}
          alt={dictionary.meta.ogAlt}
          fill
          priority={activeSlide === 0}
          sizes="100vw"
          className="object-contain object-center opacity-90"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,10,24,0.72),rgba(2,10,24,0.34),rgba(2,10,24,0.12)),linear-gradient(180deg,rgba(2,10,24,0.18),rgba(2,10,24,0.22)_62%,#020A18_98%)]" />
      <div className="section-shell pointer-events-none absolute inset-x-0 top-24 z-20 sm:top-28 lg:hidden">
        <div className="pointer-events-auto w-fit">
          <BestSwimmersCounter />
        </div>
      </div>
      <div className="section-shell relative flex min-h-[calc(92vh-96px)] items-center py-16">
        <div className="max-w-4xl">
          <div className="animate-[bestswim-content-rise_0.55s_ease-out_both]">
            <Badge>{dictionary.hero.eyebrow}</Badge>
          </div>
          <h1 className="mt-6 max-w-4xl animate-[bestswim-content-rise_0.55s_ease-out_0.08s_both] text-6xl font-semibold tracking-normal text-swim-white sm:text-7xl lg:text-8xl">
            {dictionary.hero.title}
          </h1>
          {dictionary.hero.subtitle ? (
            <p className="mt-6 max-w-2xl animate-[bestswim-content-rise_0.55s_ease-out_0.16s_both] text-lg leading-8 text-swim-white/[0.78] sm:text-xl">
              {dictionary.hero.subtitle}
            </p>
          ) : null}
          <div className="mt-9 flex animate-[bestswim-content-rise_0.55s_ease-out_0.24s_both] flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href={`/${locale}/clientes?access=monthly`}>
                <ArrowRight className="h-5 w-5" />
                {dictionary.hero.primaryCta}
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <a href="#desafios">
                <Trophy className="h-5 w-5" />
                {dictionary.hero.secondaryCta}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
