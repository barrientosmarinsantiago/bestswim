"use client";

import { useEffect, useMemo, useState } from "react";
import { Cookie, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const CONSENT_VERSION = "2026-05-27";
const CONSENT_STORAGE_KEY = "bestswim_cookie_consent_v1";
const CONSENT_COOKIE_NAME = "bestswim_cookie_consent";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  version: string;
  updatedAt: string;
};

const copyByLocale = {
  es: {
    bannerTitle: "Preferencias de cookies",
    bannerText:
      "Usamos cookies necesarias para que la web funcione. Las cookies de analítica, rendimiento o marketing solo se activan con tu consentimiento.",
    acceptAll: "Aceptar todas",
    rejectAll: "Rechazar no esenciales",
    configure: "Configurar",
    save: "Guardar preferencias",
    close: "Cerrar",
    modalTitle: "Centro de preferencias de cookies",
    modalText: "Puedes cambiar o retirar tu consentimiento en cualquier momento.",
    necessaryTitle: "Estrictamente necesarias",
    necessaryText: "Siempre activas. Mantienen seguridad, sesión y funcionamiento básico.",
    analyticsTitle: "Rendimiento y analítica",
    analyticsText: "Ayudan a entender el uso de la web y mejorar la experiencia.",
    marketingTitle: "Funcionalidad y marketing",
    marketingText: "Permiten funciones mejoradas, contenido personalizado o medición de campañas."
  },
  en: {
    bannerTitle: "Cookie preferences",
    bannerText:
      "We use necessary cookies for the website to work. Analytics, performance or marketing cookies are only activated with your consent.",
    acceptAll: "Accept all",
    rejectAll: "Reject non-essential",
    configure: "Configure",
    save: "Save preferences",
    close: "Close",
    modalTitle: "Cookie preference center",
    modalText: "You can change or withdraw consent at any time.",
    necessaryTitle: "Strictly necessary",
    necessaryText: "Always active. They support security, session and basic website operation.",
    analyticsTitle: "Performance and analytics",
    analyticsText: "Help us understand site usage and improve the experience.",
    marketingTitle: "Functionality and marketing",
    marketingText: "Allow enhanced features, personalised content or campaign measurement."
  },
  pt: {
    bannerTitle: "Preferências de cookies",
    bannerText:
      "Usamos cookies necessários para que o site funcione. Cookies de analítica, desempenho ou marketing só são ativados com o seu consentimento.",
    acceptAll: "Aceitar todos",
    rejectAll: "Rejeitar não essenciais",
    configure: "Configurar",
    save: "Guardar preferências",
    close: "Fechar",
    modalTitle: "Centro de preferências de cookies",
    modalText: "Pode alterar ou retirar o consentimento a qualquer momento.",
    necessaryTitle: "Estritamente necessários",
    necessaryText: "Sempre ativos. Mantêm segurança, sessão e funcionamento básico.",
    analyticsTitle: "Desempenho e analítica",
    analyticsText: "Ajudam a entender o uso do site e melhorar a experiência.",
    marketingTitle: "Funcionalidade e marketing",
    marketingText: "Permitem funcionalidades melhoradas, conteúdo personalizado ou medição de campanhas."
  }
};

function createPreferences(analytics: boolean, marketing: boolean): CookiePreferences {
  return {
    necessary: true,
    analytics,
    marketing,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString()
  };
}

function persistPreferences(preferences: CookiePreferences) {
  const value = encodeURIComponent(JSON.stringify(preferences));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

function readPreferences() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CookiePreferences;
    return parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export function CookieConsent({ locale }: { locale: Locale }) {
  const copy = copyByLocale[locale];
  const [mounted, setMounted] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const preferenceRows = useMemo(
    () => [
      {
        title: copy.necessaryTitle,
        description: copy.necessaryText,
        checked: true,
        disabled: true,
        onChange: undefined
      },
      {
        title: copy.analyticsTitle,
        description: copy.analyticsText,
        checked: analytics,
        disabled: false,
        onChange: setAnalytics
      },
      {
        title: copy.marketingTitle,
        description: copy.marketingText,
        checked: marketing,
        disabled: false,
        onChange: setMarketing
      }
    ],
    [analytics, copy, marketing]
  );

  useEffect(() => {
    function openPreferences() {
      const current = readPreferences();
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setPreferencesOpen(true);
      setBannerOpen(false);
    }

    window.addEventListener("bestswim:open-cookie-preferences", openPreferences);
    const timer = window.setTimeout(() => {
      const saved = readPreferences();

      if (saved) {
        setAnalytics(saved.analytics);
        setMarketing(saved.marketing);
      } else {
        setBannerOpen(true);
      }

      setMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("bestswim:open-cookie-preferences", openPreferences);
    };
  }, []);

  function savePreferences(nextAnalytics = analytics, nextMarketing = marketing) {
    persistPreferences(createPreferences(nextAnalytics, nextMarketing));
    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
    setBannerOpen(false);
    setPreferencesOpen(false);
  }

  if (!mounted) {
    return null;
  }

  return (
    <>
      {bannerOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-swim-ink/95 px-4 py-4 text-swim-white shadow-lift backdrop-blur-xl">
          <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex gap-3">
              <Cookie className="mt-1 h-5 w-5 flex-none text-swim-cyan" />
              <div>
                <p className="font-semibold">{copy.bannerTitle}</p>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-swim-steel">{copy.bannerText}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="secondary" onClick={() => savePreferences(false, false)}>
                {copy.rejectAll}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setPreferencesOpen(true)}>
                <Settings2 className="h-4 w-4" />
                {copy.configure}
              </Button>
              <Button type="button" onClick={() => savePreferences(true, true)}>
                {copy.acceptAll}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {preferencesOpen ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-swim-navy/85 p-4 backdrop-blur-xl">
          <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-swim-ink p-5 shadow-lift">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-swim-cyan">{copy.bannerTitle}</p>
                <h2 className="mt-3 text-3xl font-semibold text-swim-white">{copy.modalTitle}</h2>
                <p className="mt-3 leading-7 text-swim-steel">{copy.modalText}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setPreferencesOpen(false)} aria-label={copy.close}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              {preferenceRows.map((row) => (
                <label
                  key={row.title}
                  className={cn(
                    "flex items-start justify-between gap-4 rounded-md border border-white/10 bg-white/[0.06] p-4",
                    row.disabled ? "cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  <span>
                    <span className="block font-semibold text-swim-white">{row.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-swim-steel">{row.description}</span>
                  </span>
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 accent-cyan-400"
                    checked={row.checked}
                    disabled={row.disabled}
                    onChange={(event) => row.onChange?.(event.target.checked)}
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => savePreferences(false, false)}>
                {copy.rejectAll}
              </Button>
              <Button type="button" onClick={() => savePreferences()}>
                {copy.save}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
