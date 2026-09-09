// Datos y textos estáticos de la landing (sin lógica). Extraído de landing-page.tsx
// para reducir el componente monolítico y centralizar la copia.

export const campGalleryImages = Array.from(
  { length: 26 },
  (_, index) => `/import-assets/camps/camp-${String(index + 1).padStart(2, "0")}.webp`
);

export const contactEmail = "bestswim.info@gmail.com";
export const contactWhatsApp = "🇪🇸 +34 614 618 281";
export const contactWhatsAppHref = "whatsapp://send?phone=34614618281";
export const contactEmailHref = `mailto:${contactEmail}?subject=Consulta%20Best%20Swim`;

export const bodyFactoryPartnerLogo = "/import-assets/partners/body-factory.webp";
export const bodyFactoryPartnerUrl = "https://www.bodyfactory.es/gimnasio-wellness-center-pozuelo.html";
export const threeStylePartnerLogo = "/import-assets/partners/3style.webp";
export const threeStylePartnerUrl =
  "https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.instagram.com/3styletriatlon/&ved=2ahUKEwi60_qMl4mVAxW6_7sIHR4SEMcQFnoECCIQAQ&usg=AOvVaw2uA_QfvcCHeaINAN3-0rLl";

export const partnersCopy = {
  es: {
    eyebrow: "Partners",
    title: "Partners",
    description: "",
    bodyFactoryName: "Body Factory Pozuelo de Alarcon",
    bodyFactoryType: "Wellness Center",
    threeStyleName: "3Style",
    threeStyleType: "Club de Triatlón",
    threeStyleMeta: "Pozuelo de Alarcón",
    cta: "Ver Partner"
  },
  en: {
    eyebrow: "Partners",
    title: "Partners",
    description: "",
    bodyFactoryName: "Body Factory Pozuelo de Alarcon",
    bodyFactoryType: "Wellness Center",
    threeStyleName: "3Style",
    threeStyleType: "Triathlon Club",
    threeStyleMeta: "Pozuelo de Alarcón",
    cta: "View Partner"
  },
  pt: {
    eyebrow: "Partners",
    title: "Partners",
    description: "",
    bodyFactoryName: "Body Factory Pozuelo de Alarcon",
    bodyFactoryType: "Wellness Center",
    threeStyleName: "3Style",
    threeStyleType: "Clube de Triatlo",
    threeStyleMeta: "Pozuelo de Alarcón",
    cta: "Ver Partner"
  }
} as const;

export const landingServiceTicker = {
  es: {
    label: "Servicios Best Swim",
    items: [
      "Técnica y Aprendizaje",
      "Entrenamiento de Natación",
      "Preparación aguas abiertas y triatlón",
      "Oposiciones de Policías y Bomberos",
      "Membresía mensual o anual"
    ]
  },
  en: {
    label: "Best Swim services",
    items: [
      "Technique and Learning",
      "Swimming Training",
      "Open-water and triathlon preparation",
      "Police and Firefighter exam preparation",
      "Monthly or annual membership"
    ]
  },
  pt: {
    label: "Serviços Best Swim",
    items: [
      "Técnica e aprendizagem",
      "Treino de natação",
      "Preparação para águas abertas e triatlo",
      "Preparação para Polícia e Bombeiros",
      "Assinatura mensal ou anual"
    ]
  }
} as const;
