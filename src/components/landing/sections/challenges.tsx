"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  localHref,
  RailIndicator,
  scrollRailItemIntoView,
  SectionHeading,
  useElementInView
} from "@/components/landing/landing-shared";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function Challenges({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const challenges = dictionary.challenges.items;
  const challengeCount = challenges.length;
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [sectionRef, sectionInView] = useElementInView<HTMLElement>();
  const challengeRailRef = useRef<HTMLDivElement | null>(null);
  const challengeRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  function selectChallenge(index: number) {
    const nextIndex = (index + challengeCount) % challengeCount;
    setActiveChallenge(nextIndex);
    scrollRailItemIntoView(challengeRailRef.current, challengeRefs.current[nextIndex]);
  }

  useEffect(() => {
    if (challengeCount < 2 || !sectionInView) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveChallenge((current) => {
        const nextIndex = (current + 1) % challengeCount;
        window.requestAnimationFrame(() => {
          scrollRailItemIntoView(challengeRailRef.current, challengeRefs.current[nextIndex]);
        });
        return nextIndex;
      });
    }, 5200);

    return () => window.clearInterval(interval);
  }, [challengeCount, sectionInView]);

  return (
    <section
      ref={sectionRef}
      id="desafios"
      className="bg-[radial-gradient(circle_at_18%_8%,rgba(13,75,255,0.24),transparent_30rem),linear-gradient(180deg,#020A18_0%,#031B33_100%)] py-24 [content-visibility:auto] [contain-intrinsic-size:auto_1100px]"
    >
      <div className="section-shell overflow-hidden">
        <SectionHeading {...dictionary.challenges} align="center" />
        <div className="relative mt-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#020A18] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#031B33] to-transparent" />
          <div ref={challengeRailRef} className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {challenges.map((challenge, index) => (
              <Link
                key={challenge.title}
                ref={(node) => {
                  challengeRefs.current[index] = node;
                }}
                href={localHref(locale, challenge.href)}
                prefetch={false}
                className="group block w-[310px] flex-none snap-center sm:w-[360px] lg:w-[410px]"
              >
                <article className="flex h-[560px] flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-swim-ink shadow-lift transition hover:border-swim-cyan/[0.38]">
                  <div className="flex aspect-[16/9] flex-none items-center justify-center border-b border-white/10 bg-swim-navy p-2">
                    {challenge.image ? (
                      <img
                        src={challenge.image}
                        alt={challenge.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.025]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-swim-cyan/40 text-xs font-semibold uppercase tracking-[0.18em] text-swim-cyan/70">
                        Insertar imagen
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Badge>{challenge.level}</Badge>
                      <span className="rounded-md bg-white/[0.12] px-2.5 py-1 text-xs font-semibold text-swim-white">
                        {challenge.distance}
                      </span>
                    </div>
                    <h3 className="line-clamp-2 text-3xl font-semibold">{challenge.title}</h3>
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-swim-white/[0.76]">{challenge.goal}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-swim-aqua">
                      {dictionary.nav.challenges}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          <RailIndicator count={challengeCount} activeIndex={activeChallenge} onSelect={selectChallenge} label="Seleccionar reto" />
        </div>
      </div>
    </section>
  );
}
