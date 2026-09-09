// Cargador de documentos de entrenamiento del portal + helpers de origen/URL. Extraído de client-portal.tsx.

import type { ImportedDocument } from "@/content/types";
import type { Locale } from "@/i18n/config";

export const portalWatermark = "/import-assets/watermark/Logov1-transparent.png";

// Resolves the rich training document from the server (no longer bundled in the client).
// The endpoint re-checks entitlement via RLS, so non-entitled users never receive premium
// bodies. Cached per source_key+locale to dedupe requests across session cards.
const portalDocumentCache = new Map<string, Promise<ImportedDocument | null>>();

export function loadPortalTrainingDocument(sourceKey: string, locale: Locale): Promise<ImportedDocument | null> {
  const cacheKey = `${locale}:${sourceKey}`;
  const cached = portalDocumentCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const request = fetch(`/api/portal/content?sourceKey=${encodeURIComponent(sourceKey)}&locale=${locale}`, {
    cache: "no-store",
    credentials: "same-origin"
  })
    .then(async (response) => {
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json().catch(() => ({}))) as { document?: ImportedDocument | null };
      return payload.document ?? null;
    })
    .catch(() => null);

  portalDocumentCache.set(cacheKey, request);
  return request;
}

export function getAuthRedirectOrigin(currentOrigin: string) {
  const currentUrl = new URL(currentOrigin);

  if (currentUrl.hostname === "0.0.0.0" || currentUrl.hostname === "127.0.0.1") {
    currentUrl.hostname = "localhost";
  }

  return currentUrl.origin;
}

export function getNormalizedLocalhostHref(currentHref: string) {
  const currentUrl = new URL(currentHref);

  if (currentUrl.protocol === "http:" && (currentUrl.hostname === "0.0.0.0" || currentUrl.hostname === "127.0.0.1")) {
    currentUrl.hostname = "localhost";
    return currentUrl.toString();
  }

  return null;
}
