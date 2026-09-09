"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";

export type ContentAccessLevel = "public" | "free" | "premium";
export type LockedContentVariant = Exclude<ContentAccessLevel, "premium">;

type ContentAccessResponse = {
  level?: ContentAccessLevel;
};

const accessLimits: Record<ContentAccessLevel, number> = {
  public: 3,
  free: 10,
  premium: Number.POSITIVE_INFINITY
};

const lockedCopy = {
  es: {
    public: {
      badge: "Contenido protegido",
      message: "Prueba el Pase Semanal o Premium",
      cta: "Pase Semanal",
      hrefAccess: "weekly"
    },
    free: {
      badge: "Premium",
      message: "Actualízate a Premium",
      cta: "Ver planes Premium",
      hrefAccess: "monthly"
    }
  },
  en: {
    public: {
      badge: "Protected content",
      message: "Try the Weekly Pass or Premium",
      cta: "Weekly Pass",
      hrefAccess: "weekly"
    },
    free: {
      badge: "Premium",
      message: "Upgrade to Premium",
      cta: "View Premium plans",
      hrefAccess: "monthly"
    }
  },
  pt: {
    public: {
      badge: "Conteudo protegido",
      message: "Experimente o Passe Semanal ou Premium",
      cta: "Passe Semanal",
      hrefAccess: "weekly"
    },
    free: {
      badge: "Premium",
      message: "Atualize para Premium",
      cta: "Ver planos Premium",
      hrefAccess: "monthly"
    }
  }
} as const;

export function getContentAccessLimit(level: ContentAccessLevel) {
  return accessLimits[level];
}

export function getLockedContentVariant(level: ContentAccessLevel): LockedContentVariant | null {
  return level === "premium" ? null : level;
}

export function useContentAccessLevel() {
  const [level, setLevel] = useState<ContentAccessLevel>("public");

  useEffect(() => {
    let mounted = true;

    async function loadAccess() {
      try {
        const response = await fetch("/api/content-access", {
          cache: "no-store",
          credentials: "same-origin"
        });
        const payload = (await response.json().catch(() => ({}))) as ContentAccessResponse;

        if (mounted && (payload.level === "public" || payload.level === "free" || payload.level === "premium")) {
          setLevel(payload.level);
        }
      } catch {
        if (mounted) {
          setLevel("public");
        }
      }
    }

    loadAccess();

    return () => {
      mounted = false;
    };
  }, []);

  return level;
}

export function LockedContentCard({
  locale,
  variant,
  title,
  summary
}: {
  locale: Locale;
  variant: LockedContentVariant;
  title: string;
  summary?: string;
}) {
  const copy = lockedCopy[locale][variant];

  return (
    <article className="relative overflow-hidden rounded-lg border border-swim-cyan/20 bg-white/[0.045] p-5 shadow-lift">
      <div className="absolute inset-0 bg-swim-ink/45 backdrop-blur-[2px]" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Badge>{copy.badge}</Badge>
          <div className="mt-3 flex items-start gap-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-md border border-swim-cyan/25 bg-swim-cyan/10 text-swim-cyan">
              <LockKeyhole className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="break-words text-lg font-semibold text-swim-white [overflow-wrap:anywhere]">{title}</h3>
              {summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-swim-steel">{summary}</p> : null}
              <p className="mt-2 text-sm font-semibold text-swim-aqua">{copy.message}</p>
            </div>
          </div>
        </div>
        <Button asChild variant="secondary" className="w-full sm:w-auto">
          <Link href={`/${locale}/clientes?access=${copy.hrefAccess}`}>
            <ArrowRight className="h-4 w-4" />
            {copy.cta}
          </Link>
        </Button>
      </div>
    </article>
  );
}
