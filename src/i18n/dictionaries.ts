import type { Locale } from "./config";

const sharedImages = {
  hero: "/import-assets/hero/hero-03.webp",
  heroSlides: [
    "/import-assets/hero/hero-03.webp",
    "/import-assets/hero/hero-04.webp",
    "/import-assets/hero/hero-05.webp",
    "/import-assets/hero/hero-08.webp",
    "/import-assets/hero/hero-14.webp",
    "/import-assets/hero/hero-15.webp",
    "/import-assets/hero/hero-16.webp",
    "/import-assets/hero/hero-17.webp",
    "/import-assets/hero/hero-01.webp",
    "/import-assets/hero/hero-02.webp",
    "/import-assets/hero/hero-06.webp",
    "/import-assets/hero/hero-07.webp",
    "/import-assets/hero/hero-09.webp",
    "/import-assets/hero/hero-10.webp",
    "/import-assets/hero/hero-11.webp",
    "/import-assets/hero/hero-12.webp",
    "/import-assets/hero/hero-13.webp"
  ],
  lane:
    "https://horizons-cdn.hostinger.com/c21123b8-48ef-4efa-8696-fe2ff93be9e0/6788b80f2e64fcb310d81fd4ce5bbd45.jpg",
  openWater:
    "https://horizons-cdn.hostinger.com/c21123b8-48ef-4efa-8696-fe2ff93be9e0/72be26e3e723854edfd3a15fa3ec2b10.jpg",
  coach:
    "/import-assets/coach/ivan-santa-cruz.webp",
  alcatraz:
    "/import-assets/challenges/reto-7km.webp",
  gibraltar:
    "/import-assets/challenges/reto-14km-gibraltar.webp",
  riviera:
    "/import-assets/challenges/reto-21km.webp",
  camp:
    "/import-assets/camps/orellana-final-2026.webp"
};

const baseDictionaries = {
  es: {
    meta: {
      title: "Best Swim | Entrenamiento de natación, retos y membresía",
      description:
        "Entrena natación con una metodología clara, sesiones semanales, retos de aguas abiertas y acceso privado para clientes.",
      ogAlt: "Nadador entrenando en aguas abiertas con Best Swim"
    },
    nav: {
      programs: "Natación",
      challenges: "Desafíos",
      stories: "Historias",
      shop: "Tienda",
      camps: "Swim Camps",
      coach: "Entrenador",
      contact: "Contacto",
      pricing: "Membresía",
      portal: "Portal"
    },
    hero: {
      eyebrow: "TECHNIQUE, TRAINING AND OPEN WATER SKILLS",
      title: "Best Swim",
      subtitle: "",
      primaryCta: "Unirme a la membresía",
      secondaryCta: "Ver desafíos",
      dashboardLabel: "",
      progress: "72% completado",
      metricLabel: "Ritmo objetivo",
      metricValue: "1:38 / 100 m"
    },
    quoteTicker: {
      label: "Frases de nadadores",
      items: [
        { quote: "If you can visualize it, you can do it", author: "Adam Peaty" },
        { quote: "If you haven't failed, you aren't pushing hard enough", author: "Adam Peaty" },
        { quote: "Don't limit yourself. You are more capable than you think.", author: "Katie Ledecky" },
        {
          quote: "When I go out and race, I'm not trying to beat opponents; I'm trying to beat what I've done, basically beat myself.",
          author: "Ian Thorpe"
        },
        {
          quote:
            "The water is your friend. You don't have to fight with water, just share the same spirit as the water, and it will help you move",
          author: "Aleksandr Popov"
        },
        {
          quote:
            "You can tell a great athlete not by how many times they win, but how they react when they lose. Because that's what really defines a swimmer",
          author: "Aleksandr Popov"
        }
      ]
    },
    programs: {
      eyebrow: "Entrenamiento",
      title: "Elige tu plan de entrenamiento",
      description: "",
      items: [
        {
          title: "Técnica y aprendizaje",
          description: "Mejora tu técnica y aprendizaje en el agua.",
          href: "/natacion/tecnica"
        },
        {
          title: "Bases del entrenamiento",
          description: "Comprende los conceptos clave para tus sesiones de entrenamiento.",
          href: "/natacion/bases-entrenamiento"
        },
        {
          title: "Entrenamiento",
          description: "Librería de sesiones de entrenamiento según tu nivel.",
          href: "/natacion/entrenamiento"
        },
        {
          title: "Aguas abiertas y triatlón",
          description: "Mejora tu técnica, condición física y habilidades acuáticas para tus competiciones.",
          href: "/natacion/aguas-abiertas-triatlon"
        },
        {
          title: "Oposiciones",
          description: "Preparación específica para las pruebas de natación en las oposiciones de Policía y Bomberos.",
          href: "/natacion/oposiciones"
        },
        {
          title: "Multimedia",
          description: "Acceso a librería de ejercicios técnicos de crol.",
          href: "/natacion/multimedia"
        }
      ]
    },
    challenges: {
      eyebrow: "Desafíos",
      title: "Retos con una narrativa clara y preparación progresiva",
      description:
        "Cada reto funciona como una meta de entrenamiento: distancia, nivel, foco mental y sesiones asociadas.",
      items: [
        {
          title: "Alcatraz 7K",
          level: "Principiante a avanzado",
          distance: "7 km",
          goal: "Tu primera gran travesía: base aeróbica y control de ritmo.",
          image: "",
          href: "/reto-alcatraz-7km-principiante"
        },
        {
          title: "Triple Corona Extremadura",
          level: "Principiante a avanzado",
          distance: "3 etapas",
          goal: "Tres etapas de aguas abiertas para construir continuidad.",
          image: "",
          href: "/reto-triple-corona-principiante"
        },
        {
          title: "Estrecho de Gibraltar 14K",
          level: "Principiante",
          distance: "14 km",
          goal: "14 km de resistencia y orientación en el Estrecho.",
          image: "",
          href: "/reto-gibraltar-14km-principiante"
        },
        {
          title: "Memorial Mike",
          level: "Intermedio y avanzado",
          distance: "28-42 km",
          goal: "El gran reto de volumen: 28 km o 42 km en sesiones de 4-6 km.",
          image: "",
          href: "/reto-memorial-mike-28km-intermedio"
        }
      ]
    },
    pricing: {
      eyebrow: "Membresía",
      title: "Membresía Best Swim",
      description:
        "Prueba la plataforma una semana por 1 € o activa Premium para entrenar con planificación semanal, acceso completo a la librería de entrenamientos y multimedia completa.",
      weeklyPass: {
        name: "Pase Semanal",
        price: "1 € / 7 días",
        badge: "Prueba",
        note: "Pago único de 1 €: 7 días de acceso, sin renovación automática. Los permisos especiales se asignan internamente.",
        cta: "Probar una semana",
        features: [
          "Sesiones tipo de entrenamiento: iniciación, intermedio y avanzado",
          "Multimedia de drills básicos",
          "Invitación swim camps",
          "Acceso portal cliente",
          "Acceso básico a librería de sesiones"
        ]
      },
      monthly: "Premium mensual",
      annual: "Premium anual",
      monthlyFallback: "22 € / mes",
      annualFallback: "240 € / año (20 €/mes)",
      annualBadge: "Mejor valor",
      cta: "Activar Premium",
      features: [
        "Portal cliente y planificación: 4 sesiones por semana",
        "Multimedia completa",
        "Descuento tienda 5%",
        "Invitación swim camps",
        "Acceso completo a librería de sesiones"
      ],
      annualFeatures: [
        "Portal cliente y planificación: 4 sesiones por semana",
        "Multimedia completa",
        "Descuento tienda 10%",
        "Invitación swim camps",
        "Acceso completo a librería de sesiones"
      ]
    },
    stories: {
      eyebrow: "Historias",
      title: "Historias reales de Best Swim",
      description:
        "Testimonios en vídeo de nadadores y opositores que han entrenado con metodología Best Swim.",
      items: [
        { title: "Noé", video: "/import-assets/stories/story-01.mp4", poster: "/import-assets/stories/story-01.webp" },
        { title: "Santiago", video: "/import-assets/stories/testimonio-santiago.mp4", poster: "/import-assets/stories/testimonio-santiago.webp" },
        { title: "Alberto", video: "/import-assets/stories/story-03.mp4", poster: "/import-assets/stories/story-03.webp" },
        { title: "Guillermo", video: "/import-assets/stories/story-04.mp4", poster: "/import-assets/stories/story-04.webp" },
        { title: "Iñigo", video: "/import-assets/stories/story-05.mp4", poster: "/import-assets/stories/story-05.webp" },
        { title: "Jesús", video: "/import-assets/stories/story-06.mp4", poster: "/import-assets/stories/story-06.webp" },
        { title: "José Luis", video: "/import-assets/stories/story-07.mp4", poster: "/import-assets/stories/story-07.webp" },
        { title: "Mario", video: "/import-assets/stories/story-08.mp4", poster: "/import-assets/stories/story-08.webp" },
        { title: "Ricardo", video: "/import-assets/stories/story-09.mp4", poster: "/import-assets/stories/story-09.webp" },
        { title: "Silvia", video: "/import-assets/stories/story-10.mp4", poster: "/import-assets/stories/story-10.webp" },
        { title: "Alejandra", video: "/import-assets/stories/testimonio-alejandra.mp4", poster: "/import-assets/stories/testimonio-alejandra.webp" }
      ]
    },
    shop: {
      eyebrow: "Tienda",
      title: "Próximamente - Marketplace en construcción",
      description: "",
      catalogLabel: "Material de natación",
      itemsLabel: "productos preparados",
      items: [
        "Palas de Natación",
        "Pull-buoy",
        "Paracaídas de Resistencia",
        "Tuba Frontal",
        "Tabla de Natación",
        "Gorros de Silicona",
        "Cincha de tobillos",
        "Gomas",
        "Boya",
        "Tempo trainer",
        "Goma/pala de entrenamiento en seco",
        "Goma de resistencia para el agua",
        "Red para material de natación"
      ]
    },
    camps: {
      eyebrow: "Swim Camps",
      title: "Experiencias intensivas para técnica, resistencia y confianza",
      description:
        "Grupos reducidos, preparación previa para competiciones en aguas abiertas y compartir experiencias.",
      featureTitle: "Etapa Final Triple Corona de Aguas Abiertas en Extremadura en Orellana la Vieja (Playa Costa Dulce)",
      featureDate: "Septiembre 12 de 2026.",
      interestCta: "Me interesa",
      infoCta: "Darme más información",
      interestLogin: "Inicia sesión para registrar tu interés.",
      interestSuccess: "Interés registrado. Te avisaremos cuando haya novedades.",
      interestError: "No se pudo registrar el interés. Inicia sesión o inténtalo de nuevo.",
      galleryLabel: "Swim Camp Orellana 2025",
      eventSource: "Fuente oficial FEN",
      infoTitle: "Etapa Final Orellana",
      infoDescription:
        "Resumen de la información oficial disponible para Aguas Abiertas y la Etapa Final Orellana publicada por la Federación Extremeña de Natación.",
      infoItems: [
        { label: "Fecha", value: "13 de septiembre de 2025, según el documento oficial de datos técnicos de la Etapa Final Orellana." },
        { label: "Inscripciones", value: "La página oficial enlaza inscripciones para federados y populares, además del listado oficial de inscritos de Orellana." },
        { label: "Datos técnicos", value: "Distancias de 500 m, 1.500 m y 3.000 m; categorías Alevín, Infantil, Junior, Absoluto y Máster; horario desde las 8:00." },
        { label: "Servicios", value: "Seguros, ambulancia, cronometraje, briefing, avituallamiento, obsequio y medalla para finishers." }
      ],
      officialLink: "https://fexnatacion.com/aguas-abiertas-26/",
      registrationsLink: "https://drive.google.com/file/d/1YuRoIEs8HyquQ1XWaobNsdcD989qTArE/view?usp=drive_link",
      technicalLink: "https://drive.google.com/file/d/1Rg-5Ksz92nytQqif_zyihDbZtmoGEi3m/view?usp=drive_link",
      officialCta: "Ver web oficial",
      registrationsCta: "Ver inscripciones",
      technicalCta: "Ver datos técnicos"
    },
    coach: {
      eyebrow: "Entrenador",
      title: "Iván Santa Cruz",
      description: "",
      paragraphs: [
        "Iván Santa Cruz es licenciado en Ciencias de la Actividad Física y del Deporte (INEF), maestro en Educación Física, entrenador superior de natación y especialista en aguas abiertas por la Federación Española de Natación, además de entrenador personal.",
        "Con más de 15 años de experiencia en natación competitiva y aguas abiertas, ha competido en pruebas de 2,6 km a 6 km, incluyendo Copa de España, Oceanman, Best Fest Open Water y travesías nacionales de referencia.",
        "Su palmarés suma más de 15 podios y medallas, con resultados destacados como oro en Oceanman Perú, plata en Oceanman Brasil y Triple Corona de Extremadura, bronces en Oceanman Brasil, victorias absolutas en Patacona, Buitrago y SwimStrong La Granja, y podios máster y absolutos en pruebas de larga distancia."
      ]
    },
    contact: {
      eyebrow: "Contacto",
      title: "",
      description:
        "¡Nos pondremos en contacto en breve!",
      whatsapp: "WhatsApp",
      mail: "Correo"
    },
    footer: {
      tagline: "Entrenamiento de natación, retos y contenido semanal para nadadores que quieren avanzar con método.",
      legal: "Legal",
      privacy: "Privacidad",
      cookies: "Cookies",
      cookiePreferences: "Preferencias de cookies"
    },
    portal: {
      title: "Portal de clientes",
      description: "Accede con Google, Facebook o Apple para ver tus sesiones y gestionar tu membresía.",
      signIn: "Entrar con",
      signOut: "Cerrar sesión",
      myPortal: "Mi portal",
      billing: "Gestionar facturación",
      subscribe: "Activar membresía",
      weeklyTitle: "Plan Semanal",
      locked: "Inicia sesión para ver tu dashboard.",
      inactive: "Tu cuenta existe, pero la membresía activa se validará con Stripe.",
      noSessionsTitle: "Todavía no hay sesiones publicadas",
      noSessionsDescription: "Cuando publiques contenido semanal en Supabase, aparecerá aquí automáticamente según el acceso del cliente.",
      sessionDate: "Fecha",
      difficulty: "Dificultad",
      supabaseMissing: "Faltan variables de Supabase para activar el login.",
      profileSyncError: "No se pudo sincronizar el perfil",
      subscriptionSyncError: "No se pudo leer la membresía",
      contentLoadError: "No se pudo cargar el contenido del portal"
    },
    admin: {
      title: "Admin de entrenamientos",
      description: "Publica sesiones semanales bilingües sin editar código.",
      fields: {
        titleEs: "Título ES",
        titleEn: "Título EN",
        titlePt: "Título PT",
        date: "Fecha",
        difficulty: "Dificultad",
        program: "Programa",
        bodyEs: "Contenido ES",
        bodyEn: "Contenido EN",
        bodyPt: "Contenido PT",
        published: "Publicado"
      },
      save: "Guardar sesión"
    },
    images: sharedImages
  },
  en: {
    meta: {
      title: "Best Swim | Swim training, challenges and membership",
      description:
        "Train swimming with weekly sessions, open-water challenges and a private client portal built for paid membership.",
      ogAlt: "Open-water swimmer training with Best Swim"
    },
    nav: {
      programs: "Training",
      challenges: "Challenges",
      stories: "Stories",
      shop: "Shop",
      camps: "Swim Camps",
      coach: "Coach",
      contact: "Contact",
      pricing: "Membership",
      portal: "Portal"
    },
    hero: {
      eyebrow: "TECHNIQUE, TRAINING AND OPEN WATER SKILLS",
      title: "Best Swim",
      subtitle: "",
      primaryCta: "Join membership",
      secondaryCta: "View challenges",
      dashboardLabel: "",
      progress: "72% complete",
      metricLabel: "Target pace",
      metricValue: "1:38 / 100 m"
    },
    quoteTicker: {
      label: "Swimmer quotes",
      items: [
        { quote: "If you can visualize it, you can do it", author: "Adam Peaty" },
        { quote: "If you haven't failed, you aren't pushing hard enough", author: "Adam Peaty" },
        { quote: "Don't limit yourself. You are more capable than you think.", author: "Katie Ledecky" },
        {
          quote: "When I go out and race, I'm not trying to beat opponents; I'm trying to beat what I've done, basically beat myself.",
          author: "Ian Thorpe"
        },
        {
          quote:
            "The water is your friend. You don't have to fight with water, just share the same spirit as the water, and it will help you move",
          author: "Aleksandr Popov"
        },
        {
          quote:
            "You can tell a great athlete not by how many times they win, but how they react when they lose. Because that's what really defines a swimmer",
          author: "Aleksandr Popov"
        }
      ]
    },
    programs: {
      eyebrow: "Training",
      title: "Choose your training plan",
      description: "",
      items: [
        {
          title: "Technique and learning",
          description: "Improve your technique and learning in the water.",
          href: "/natacion/tecnica"
        },
        {
          title: "Training foundations",
          description: "Understand the key concepts behind your training sessions.",
          href: "/natacion/bases-entrenamiento"
        },
        {
          title: "Training",
          description: "A training session library matched to your level.",
          href: "/natacion/entrenamiento"
        },
        {
          title: "Open water and triathlon",
          description: "Improve your technique, fitness and water skills for your competitions.",
          href: "/natacion/aguas-abiertas-triatlon"
        },
        {
          title: "Public-service tests",
          description: "Specific preparation for police and firefighter swimming tests.",
          href: "/natacion/oposiciones"
        },
        {
          title: "Multimedia",
          description: "Access to a freestyle technical exercise library.",
          href: "/natacion/multimedia"
        }
      ]
    },
    challenges: {
      eyebrow: "Challenges",
      title: "Challenge pages with clear goals and progressive preparation",
      description:
        "Each challenge works as a training target: distance, level, mindset and linked sessions.",
      items: [
        {
          title: "Alcatraz 7K",
          level: "Beginner to advanced",
          distance: "7 km",
          goal: "Your first major open-water swim: aerobic base and pacing control.",
          image: "",
          href: "/reto-alcatraz-7km-principiante"
        },
        {
          title: "Extremadura Triple Crown",
          level: "Beginner to advanced",
          distance: "3 stages",
          goal: "Three open-water stages to build continuity.",
          image: "",
          href: "/reto-triple-corona-principiante"
        },
        {
          title: "Strait of Gibraltar 14K",
          level: "Beginner",
          distance: "14 km",
          goal: "14 km of endurance and orientation across the Strait.",
          image: "",
          href: "/reto-gibraltar-14km-principiante"
        },
        {
          title: "Memorial Mike",
          level: "Intermediate and advanced",
          distance: "28-42 km",
          goal: "The big volume challenge: 28 km or 42 km across 4-6 km sessions.",
          image: "",
          href: "/reto-memorial-mike-28km-intermedio"
        }
      ]
    },
    pricing: {
      eyebrow: "Membership",
      title: "Best Swim Membership",
      description:
        "Try the platform for a week for €1, or activate Premium for weekly planning, complete access to the training library and full multimedia.",
      weeklyPass: {
        name: "Weekly Pass",
        price: "€1 / 7 days",
        badge: "Trial",
        note: "One-off €1 payment: 7 days of access, no auto-renewal. Special permissions are assigned internally.",
        cta: "Try for a week",
        features: [
          "Sample training sessions: beginner, intermediate and advanced",
          "Basic drill multimedia",
          "Swim camp invitations",
          "Client portal access",
          "Basic session-library access"
        ]
      },
      monthly: "Premium monthly",
      annual: "Premium annual",
      monthlyFallback: "€22 / month",
      annualFallback: "€240 / year (€20/month)",
      annualBadge: "Best value",
      cta: "Activate Premium",
      features: [
        "Client portal and planning: 4 sessions per week",
        "Full multimedia access",
        "5% shop discount",
        "Swim camp invitations",
        "Full session-library access"
      ],
      annualFeatures: [
        "Client portal and planning: 4 sessions per week",
        "Full multimedia access",
        "10% shop discount",
        "Swim camp invitations",
        "Full session-library access"
      ]
    },
    stories: {
      eyebrow: "Stories",
      title: "Real Best Swim Stories",
      description:
        "Video testimonials from swimmers and public-service candidates who trained with the Best Swim method.",
      items: [
        { title: "Noé", video: "/import-assets/stories/story-01.mp4", poster: "/import-assets/stories/story-01.webp" },
        { title: "Santiago", video: "/import-assets/stories/testimonio-santiago.mp4", poster: "/import-assets/stories/testimonio-santiago.webp" },
        { title: "Alberto", video: "/import-assets/stories/story-03.mp4", poster: "/import-assets/stories/story-03.webp" },
        { title: "Guillermo", video: "/import-assets/stories/story-04.mp4", poster: "/import-assets/stories/story-04.webp" },
        { title: "Iñigo", video: "/import-assets/stories/story-05.mp4", poster: "/import-assets/stories/story-05.webp" },
        { title: "Jesús", video: "/import-assets/stories/story-06.mp4", poster: "/import-assets/stories/story-06.webp" },
        { title: "José Luis", video: "/import-assets/stories/story-07.mp4", poster: "/import-assets/stories/story-07.webp" },
        { title: "Mario", video: "/import-assets/stories/story-08.mp4", poster: "/import-assets/stories/story-08.webp" },
        { title: "Ricardo", video: "/import-assets/stories/story-09.mp4", poster: "/import-assets/stories/story-09.webp" },
        { title: "Silvia", video: "/import-assets/stories/story-10.mp4", poster: "/import-assets/stories/story-10.webp" },
        { title: "Alejandra", video: "/import-assets/stories/testimonio-alejandra.mp4", poster: "/import-assets/stories/testimonio-alejandra.webp" }
      ]
    },
    shop: {
      eyebrow: "Shop",
      title: "Coming soon - Marketplace under construction",
      description: "",
      catalogLabel: "Swim equipment",
      itemsLabel: "items prepared",
      items: [
        "Swim paddles",
        "Pull buoy",
        "Resistance parachute",
        "Front snorkel",
        "Kickboard",
        "Silicone caps",
        "Ankle band",
        "Resistance bands",
        "Open-water buoy",
        "Tempo trainer",
        "Dryland training band/paddle",
        "Water resistance band",
        "Swim gear mesh bag"
      ]
    },
    camps: {
      eyebrow: "Swim Camps",
      title: "Intensive experiences for technique, endurance and confidence",
      description:
        "Small groups, previous preparation for open-water competitions and shared experiences.",
      featureTitle: "Final stage of the Triple Corona Open Water Series in Extremadura, Orellana la Vieja (Playa Costa Dulce)",
      featureDate: "September 12, 2026.",
      interestCta: "I'm interested",
      infoCta: "Give me more information",
      interestLogin: "Sign in to register your interest.",
      interestSuccess: "Interest registered. We will notify you when there are updates.",
      interestError: "Could not register interest. Sign in or try again.",
      galleryLabel: "Swim Camp Orellana 2025",
      eventSource: "Official FEN source",
      infoTitle: "Orellana Final Stage",
      infoDescription:
        "Summary of the official open-water information available for the Orellana Final Stage published by the Extremadura Swimming Federation.",
      infoItems: [
        { label: "Date", value: "September 13, 2025, according to the official technical-data document for the Orellana Final Stage." },
        { label: "Registration", value: "The official page links registration for federated and popular swimmers, plus the official Orellana entry list." },
        { label: "Technical data", value: "Distances of 500 m, 1,500 m and 3,000 m; Alevín, Infantil, Junior, Absolute and Master categories; schedule from 8:00." },
        { label: "Services", value: "Insurance, ambulance, timing, briefing, aid station, gift and finisher medal." }
      ],
      officialLink: "https://fexnatacion.com/aguas-abiertas-26/",
      registrationsLink: "https://drive.google.com/file/d/1YuRoIEs8HyquQ1XWaobNsdcD989qTArE/view?usp=drive_link",
      technicalLink: "https://drive.google.com/file/d/1Rg-5Ksz92nytQqif_zyihDbZtmoGEi3m/view?usp=drive_link",
      officialCta: "View official site",
      registrationsCta: "View registrations",
      technicalCta: "View technical data"
    },
    coach: {
      eyebrow: "Coach",
      title: "Iván Santa Cruz",
      description: "",
      paragraphs: [
        "Iván Santa Cruz holds a degree in Physical Activity and Sport Sciences (INEF), is a Physical Education teacher, senior swimming coach and open-water specialist certified by the Spanish Swimming Federation, as well as a personal trainer.",
        "With more than 15 years of experience in competitive swimming and open water, he has raced distances from 2.6 km to 6 km, including the Copa de España, Oceanman, Best Fest Open Water and leading national open-water events.",
        "His record includes more than 15 podiums and medals, with highlights such as gold at Oceanman Peru, silver at Oceanman Brazil and Triple Corona de Extremadura, bronze medals at Oceanman Brazil, overall wins at Patacona, Buitrago and SwimStrong La Granja, plus master and overall podiums in long-distance events."
      ]
    },
    contact: {
      eyebrow: "Contact",
      title: "",
      description:
        "We will contact you shortly!",
      whatsapp: "WhatsApp",
      mail: "Email"
    },
    footer: {
      tagline: "Swim training, challenges and weekly content for swimmers who want to progress with method.",
      legal: "Legal",
      privacy: "Privacy",
      cookies: "Cookies",
      cookiePreferences: "Cookie preferences"
    },
    portal: {
      title: "Client portal",
      description: "Sign in with Google, Facebook or Apple to view sessions and manage your membership.",
      signIn: "Continue with",
      signOut: "Sign out",
      myPortal: "My portal",
      billing: "Manage billing",
      subscribe: "Activate membership",
      weeklyTitle: "Weekly Plan",
      locked: "Sign in to view your dashboard.",
      inactive: "Your account exists, but active membership will be validated with Stripe.",
      noSessionsTitle: "No sessions published yet",
      noSessionsDescription: "When you publish weekly content in Supabase, it will appear here automatically according to each client's access.",
      sessionDate: "Date",
      difficulty: "Difficulty",
      supabaseMissing: "Supabase environment variables are missing, so login is disabled.",
      profileSyncError: "Could not sync profile",
      subscriptionSyncError: "Could not read membership",
      contentLoadError: "Could not load portal content"
    },
    admin: {
      title: "Training admin",
      description: "Publish bilingual weekly sessions without editing code.",
      fields: {
        titleEs: "Title ES",
        titleEn: "Title EN",
        titlePt: "Title PT",
        date: "Date",
        difficulty: "Difficulty",
        program: "Program",
        bodyEs: "Content ES",
        bodyEn: "Content EN",
        bodyPt: "Content PT",
        published: "Published"
      },
      save: "Save session"
    },
    images: sharedImages
  }
} as const;

export const dictionaries = {
  ...baseDictionaries,
  pt: {
    ...baseDictionaries.es,
    meta: {
      title: "Best Swim | Treino de natação, desafios e assinatura",
      description:
        "Treine natação com uma metodologia clara, sessões semanais, desafios de águas abertas e acesso privado para clientes.",
      ogAlt: "Nadador treinando em águas abertas com Best Swim"
    },
    nav: {
      programs: "Natação",
      challenges: "Desafios",
      stories: "Histórias",
      shop: "Loja",
      camps: "Swim Camps",
      coach: "Treinador",
      contact: "Contato",
      pricing: "Assinatura",
      portal: "Portal"
    },
    hero: {
      ...baseDictionaries.es.hero,
      primaryCta: "Entrar na assinatura",
      secondaryCta: "Ver desafios",
      nextSession: "Técnica + limiar",
      progress: "72% concluído",
      metricLabel: "Ritmo-alvo"
    },
    quoteTicker: {
      label: "Frases de nadadores",
      items: baseDictionaries.es.quoteTicker.items
    },
    programs: {
      eyebrow: "Treino",
      title: "Escolha o seu plano de treino",
      description: "",
      items: [
        {
          title: "Técnica e aprendizagem",
          description: "Melhore a sua técnica e aprendizagem na água.",
          href: "/natacion/tecnica"
        },
        {
          title: "Bases do treino",
          description: "Compreenda os conceitos-chave para as suas sessões de treino.",
          href: "/natacion/bases-entrenamiento"
        },
        {
          title: "Treino",
          description: "Biblioteca de sessões de treino de acordo com o seu nível.",
          href: "/natacion/entrenamiento"
        },
        {
          title: "Águas abertas e triatlo",
          description: "Melhore a sua técnica, condição física e habilidades aquáticas para as suas competições.",
          href: "/natacion/aguas-abiertas-triatlon"
        },
        {
          title: "Provas públicas",
          description: "Preparação específica para as provas de natação de polícia e bombeiros.",
          href: "/natacion/oposiciones"
        },
        {
          title: "Multimédia",
          description: "Acesso a uma biblioteca de exercícios técnicos de crawl.",
          href: "/natacion/multimedia"
        }
      ]
    },
    challenges: {
      eyebrow: "Desafios",
      title: "Desafios com objetivos claros e preparação progressiva",
      description:
        "Cada desafio funciona como uma meta de treino: distância, nível, foco mental e sessões associadas.",
      items: [
        {
          title: "Alcatraz 7K",
          level: "Principiante a avançado",
          distance: "7 km",
          goal: "A tua primeira grande travessia: base aeróbica e controlo de ritmo.",
          image: "",
          href: "/reto-alcatraz-7km-principiante"
        },
        {
          title: "Tríplice Coroa Extremadura",
          level: "Principiante a avançado",
          distance: "3 etapas",
          goal: "Três etapas de águas abertas para construir continuidade.",
          image: "",
          href: "/reto-triple-corona-principiante"
        },
        {
          title: "Estreito de Gibraltar 14K",
          level: "Principiante",
          distance: "14 km",
          goal: "14 km de resistência e orientação no Estreito.",
          image: "",
          href: "/reto-gibraltar-14km-principiante"
        },
        {
          title: "Memorial Mike",
          level: "Intermédio e avançado",
          distance: "28-42 km",
          goal: "O grande desafio de volume: 28 km ou 42 km em sessões de 4-6 km.",
          image: "",
          href: "/reto-memorial-mike-28km-intermedio"
        }
      ]
    },
    pricing: {
      eyebrow: "Assinatura",
      title: "Assinatura Best Swim",
      description:
        "Experimente a plataforma uma semana por 1 € ou ative Premium para treinar com planejamento semanal, acesso completo à biblioteca de treinos e multimédia completa.",
      weeklyPass: {
        name: "Passe Semanal",
        price: "1 € / 7 dias",
        badge: "Teste",
        note: "Pagamento único de 1 €: 7 dias de acesso, sem renovação automática. Permissões especiais são atribuídas internamente.",
        cta: "Experimentar uma semana",
        features: [
          "Sessões-modelo de treino: iniciação, intermédio e avançado",
          "Multimédia de drills básicos",
          "Convite para swim camps",
          "Acesso ao portal do cliente",
          "Acesso básico à biblioteca de sessões"
        ]
      },
      monthly: "Premium mensal",
      annual: "Premium anual",
      monthlyFallback: "22 € / mês",
      annualFallback: "240 € / ano (20 €/mês)",
      annualBadge: "Melhor valor",
      cta: "Ativar Premium",
      features: [
        "Portal do cliente e planejamento: 4 sessões por semana",
        "Multimédia completa",
        "Desconto de 5% na loja",
        "Convite para swim camps",
        "Acesso completo à biblioteca de sessões"
      ],
      annualFeatures: [
        "Portal do cliente e planejamento: 4 sessões por semana",
        "Multimédia completa",
        "Desconto de 10% na loja",
        "Convite para swim camps",
        "Acesso completo à biblioteca de sessões"
      ]
    },
    stories: {
      ...baseDictionaries.es.stories,
      eyebrow: "Histórias",
      title: "Histórias reais da Best Swim",
      description:
        "Testemunhos em vídeo de nadadores e candidatos a provas públicas que treinaram com a metodologia Best Swim."
    },
    shop: {
      eyebrow: "Loja",
      title: "Em breve - Marketplace em construção",
      description: "",
      catalogLabel: "Material de natação",
      itemsLabel: "produtos preparados",
      items: [
        "Palmares de natação",
        "Pull-buoy",
        "Paraquedas de resistência",
        "Snorkel frontal",
        "Prancha de natação",
        "Toucas de silicone",
        "Elástico de tornozelos",
        "Elásticos",
        "Boia",
        "Tempo trainer",
        "Elástico/palmar de treino em seco",
        "Elástico de resistência para a água",
        "Rede para material de natação"
      ]
    },
    camps: {
      ...baseDictionaries.es.camps,
      title: "Experiências intensivas para técnica, resistência e confiança",
      description:
        "Grupos reduzidos, preparação prévia para competições em águas abertas e partilha de experiências.",
      featureTitle: "Etapa Final da Tríplice Coroa de Águas Abertas na Extremadura em Orellana la Vieja (Playa Costa Dulce)",
      featureDate: "12 de setembro de 2026.",
      interestCta: "Tenho interesse",
      infoCta: "Dar-me mais informação",
      interestLogin: "Inicie sessão para registrar o seu interesse.",
      interestSuccess: "Interesse registrado. Avisaremos quando houver novidades.",
      interestError: "Não foi possível registrar o interesse. Inicie sessão ou tente novamente.",
      eventSource: "Fonte oficial FEN",
      infoTitle: "Etapa Final Orellana",
      infoDescription:
        "Resumo da informação oficial disponível para Águas Abertas e a Etapa Final Orellana publicada pela Federação Extremadura de Natação.",
      infoItems: [
        { label: "Data", value: "13 de setembro de 2025, segundo o documento oficial de dados técnicos da Etapa Final Orellana." },
        { label: "Inscrições", value: "A página oficial inclui inscrições para federados e populares, além da lista oficial de inscritos de Orellana." },
        { label: "Dados técnicos", value: "Distâncias de 500 m, 1.500 m e 3.000 m; categorias Alevín, Infantil, Júnior, Absoluto e Master; horário a partir das 8:00." },
        { label: "Serviços", value: "Seguros, ambulância, cronometragem, briefing, abastecimento, brinde e medalha para finishers." }
      ],
      officialCta: "Ver site oficial",
      registrationsCta: "Ver inscrições",
      technicalCta: "Ver dados técnicos"
    },
    coach: {
      eyebrow: "Treinador",
      title: "Iván Santa Cruz",
      description: "",
      paragraphs: [
        "Iván Santa Cruz é licenciado em Ciências da Atividade Física e do Desporto (INEF), professor de Educação Física, treinador superior de natação e especialista em águas abertas pela Federação Espanhola de Natação, além de treinador pessoal.",
        "Com mais de 15 anos de experiência em natação competitiva e águas abertas, competiu em provas de 2,6 km a 6 km, incluindo Copa de Espanha, Oceanman, Best Fest Open Water e travessias nacionais de referência.",
        "O seu palmarés soma mais de 15 pódios e medalhas, com resultados como ouro no Oceanman Peru, prata no Oceanman Brasil e Tríplice Coroa da Extremadura, bronzes no Oceanman Brasil, vitórias absolutas em Patacona, Buitrago e SwimStrong La Granja, e pódios master e absolutos em provas de longa distância."
      ]
    },
    contact: {
      eyebrow: "Contato",
      title: "",
      description:
        "Entraremos em contato em breve!",
      whatsapp: "WhatsApp",
      mail: "Email"
    },
    footer: {
      tagline: "Treino de natação, desafios e conteúdo semanal para nadadores que querem evoluir com método.",
      legal: "Legal",
      privacy: "Privacidade",
      cookies: "Cookies",
      cookiePreferences: "Preferências de cookies"
    },
    portal: {
      title: "Portal de clientes",
      description: "Entre com Google, Facebook ou Apple para ver suas sessões e gerenciar sua assinatura.",
      signIn: "Entrar com",
      signOut: "Sair",
      myPortal: "Meu portal",
      billing: "Gerenciar faturamento",
      subscribe: "Ativar assinatura",
      weeklyTitle: "Plano Semanal",
      locked: "Inicie sessão para ver o seu dashboard.",
      inactive: "A sua conta existe, mas a assinatura ativa será validada com Stripe.",
      noSessionsTitle: "Ainda não há sessões publicadas",
      noSessionsDescription: "Quando publicar conteúdo semanal no Supabase, ele aparecerá aqui automaticamente conforme o acesso do cliente.",
      sessionDate: "Data",
      difficulty: "Dificuldade",
      supabaseMissing: "Faltam variáveis do Supabase para ativar o login.",
      profileSyncError: "Não foi possível sincronizar o perfil",
      subscriptionSyncError: "Não foi possível ler a assinatura",
      contentLoadError: "Não foi possível carregar o conteúdo do portal"
    },
    admin: {
      title: "Admin de treinos",
      description: "Publique sessões semanais multilíngues sem editar código.",
      fields: {
        titleEs: "Título ES",
        titleEn: "Título EN",
        titlePt: "Título PT",
        date: "Data",
        difficulty: "Dificuldade",
        program: "Programa",
        bodyEs: "Conteúdo ES",
        bodyEn: "Conteúdo EN",
        bodyPt: "Conteúdo PT",
        published: "Publicado"
      },
      save: "Guardar sessão"
    },
    images: sharedImages
  }
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
