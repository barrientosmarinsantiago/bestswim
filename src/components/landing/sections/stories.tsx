"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { Play, X } from "lucide-react";
import { RailIndicator, scrollRailItemIntoView, SectionHeading, useElementInView } from "@/components/landing/landing-shared";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Dictionary } from "@/i18n/dictionaries";

export function Stories({ dictionary }: { dictionary: Dictionary }) {
  const stories = dictionary.stories.items;
  const storyCount = stories.length;
  const [activeStory, setActiveStory] = useState(0);
  const [selectedStory, setSelectedStory] = useState<(typeof stories)[number] | null>(null);
  const [sectionRef, sectionInView] = useElementInView<HTMLElement>();
  const storyRailRef = useRef<HTMLDivElement | null>(null);
  const storyRefs = useRef<Array<HTMLDivElement | null>>([]);

  function selectStory(index: number) {
    const nextIndex = (index + storyCount) % storyCount;
    setActiveStory(nextIndex);
    scrollRailItemIntoView(storyRailRef.current, storyRefs.current[nextIndex]);
  }

  useEffect(() => {
    if (storyCount < 2 || !sectionInView) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStory((current) => {
        const nextIndex = (current + 1) % storyCount;
        window.requestAnimationFrame(() => {
          scrollRailItemIntoView(storyRailRef.current, storyRefs.current[nextIndex]);
        });
        return nextIndex;
      });
    }, 5600);

    return () => window.clearInterval(interval);
  }, [storyCount, sectionInView]);

  useEffect(() => {
    if (!selectedStory) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedStory]);

  return (
    <section
      ref={sectionRef}
      id="historias"
      className="bg-[linear-gradient(180deg,#031B33_0%,#092A4C_100%)] py-24 [contain-intrinsic-size:900px] [content-visibility:auto]"
    >
      <div className="section-shell overflow-hidden">
        <SectionHeading {...dictionary.stories} align="center" />
        <div className="relative mt-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#031B33] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#092A4C] to-transparent" />
          <div ref={storyRailRef} className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {stories.map((story, index) => (
              <div
                key={story.title}
                ref={(node) => {
                  storyRefs.current[index] = node;
                }}
                className="w-[300px] flex-none snap-center sm:w-[360px]"
              >
                <button type="button" className="group block w-full text-left" onClick={() => setSelectedStory(story)}>
                  <Card className="flex h-[390px] flex-col overflow-hidden border-white/[0.12] bg-white/[0.06] p-1 text-swim-white shadow-lift transition group-hover:border-swim-cyan/35 group-hover:bg-white/[0.085]">
                    <CardHeader className="flex flex-1 flex-col">
                      <div className="relative mb-5 h-64 flex-none overflow-hidden rounded-md border border-white/10 bg-swim-ink">
                        {story.poster ? (
                          <NextImage
                            src={story.poster}
                            alt={story.title}
                            fill
                            sizes="(max-width: 640px) 300px, 360px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-xs font-semibold uppercase tracking-[0.18em] text-swim-cyan/60">
                            Insertar imagen
                          </div>
                        )}
                        <div className="absolute inset-0 grid place-items-center bg-swim-navy/[0.18] transition group-hover:bg-swim-navy/[0.05]">
                          <span className="grid h-12 w-12 place-items-center rounded-full border border-white/25 bg-swim-navy/[0.68] text-swim-cyan backdrop-blur">
                            <Play className="ml-0.5 h-5 w-5" />
                          </span>
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2 text-swim-white">{story.title}</CardTitle>
                    </CardHeader>
                  </Card>
                </button>
              </div>
            ))}
          </div>
          <RailIndicator count={storyCount} activeIndex={activeStory} onSelect={selectStory} label="Seleccionar historia" />
        </div>
      </div>
      {selectedStory ? (
        <div
          className="fixed inset-0 z-[80] grid animate-[bestswim-modal-fade_0.2s_ease-out] place-items-center bg-swim-navy/[0.86] p-4 backdrop-blur-xl"
          onClick={() => setSelectedStory(null)}
        >
          <div
              role="dialog"
              aria-modal="true"
              aria-label={selectedStory.title}
              className="relative w-full max-w-5xl animate-[bestswim-modal-rise_0.22s_ease-out] overflow-hidden rounded-lg border border-white/10 bg-swim-ink p-3 shadow-lift"
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-5 top-5 z-10"
                onClick={() => setSelectedStory(null)}
                aria-label="Cerrar vídeo"
              >
                <X className="h-4 w-4" />
              </Button>
              <video
                src={selectedStory.video}
                poster={selectedStory.poster || undefined}
                controls
                preload="metadata"
                autoPlay
                playsInline
                className="max-h-[78vh] w-full rounded-md bg-swim-navy object-contain"
              />
              <div className="px-2 py-4">
                <h3 className="text-2xl font-semibold text-swim-white">{selectedStory.title}</h3>
              </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
