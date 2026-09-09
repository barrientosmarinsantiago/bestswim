// Textos localizados del portal (es/en/pt). Extraído de client-portal.tsx (sin lógica).
import type { Locale } from "@/i18n/config";

export function getAccessCopy(locale: Locale) {
  const copies = {
    es: {
      title: "Elige tu acceso",
      selected: "Acceso seleccionado",
      afterLogin: "Tu sesión se mantiene activa hasta que cierres sesión.",
      bodyFactoryPending:
        "Para acceso permanente Body Factory, valida este email en Supabase marcando body_factory_student.",
      weeklyDescription: "Prueba la plataforma 7 días por 1 €, pago único sin renovación.",
      bodyFactoryDescription: "Acceso permanente para alumnos presenciales, sujeto a validación interna.",
      monthlyDescription: "Premium mensual con planificación semanal y librería completa.",
      annualDescription: "Premium anual con mejor precio mensual."
    },
    en: {
      title: "Choose your access",
      selected: "Selected access",
      afterLogin: "Your session stays active until you sign out.",
      bodyFactoryPending:
        "For permanent Body Factory access, validate this email in Supabase by marking body_factory_student.",
      weeklyDescription: "Try the platform for 7 days for €1, one-off payment, no renewal.",
      bodyFactoryDescription: "Permanent access for in-person students, pending internal validation.",
      monthlyDescription: "Monthly Premium with weekly planning and the full library.",
      annualDescription: "Annual Premium with the best monthly value."
    },
    pt: {
      title: "Escolha o seu acesso",
      selected: "Acesso selecionado",
      afterLogin: "A sua sessão permanece ativa até sair.",
      bodyFactoryPending:
        "Para acesso permanente Body Factory, valide este email no Supabase marcando body_factory_student.",
      weeklyDescription: "Experimente a plataforma 7 dias por 1 €, pagamento único sem renovação.",
      bodyFactoryDescription: "Acesso permanente para alunos presenciais, sujeito a validação interna.",
      monthlyDescription: "Premium mensal com planejamento semanal e biblioteca completa.",
      annualDescription: "Premium anual com melhor valor mensal."
    }
  } as const;

  return copies[locale];
}

export function getDashboardCopy(locale: Locale) {
  const copies = {
    es: {
      dashboardEyebrow: "Dashboard",
      dashboardTitle: "Tu semana en el agua",
      dashboardDescription: "Seguimiento de sesiones, volumen y retos asignados desde Supabase.",
      weeklyPlanTitle: "Plan Semanal",
      upgrade: "Upgrade a Premium",
      manageBilling: "Facturacion",
      weeklyProgress: "Progreso semanal",
      monthlyProgress: "Progreso mensual",
      completed: "Completadas",
      planned: "planificadas",
      volumeWeek: "KM semana",
      volumeMonth: "KM mes",
      volumeYear: "KM año",
      activeGroups: "Grupos activos",
      challenges: "Retos completados",
      nextFocus: "Siguiente foco",
      estimatedFromSessions: "Calculado desde sesiones publicadas",
      premiumTitle: "Entrena con plan completo",
      premiumDescription: "Activa Premium para acceder a planificacion semanal, biblioteca completa y contenido por nivel.",
      memberStatus: "Estado",
      noVolume: "Sin volumen definido"
    },
    en: {
      dashboardEyebrow: "Dashboard",
      dashboardTitle: "Your week in the water",
      dashboardDescription: "Track sessions, volume and assigned challenges from Supabase.",
      weeklyPlanTitle: "Weekly Plan",
      upgrade: "Upgrade to Premium",
      manageBilling: "Billing",
      weeklyProgress: "Weekly progress",
      monthlyProgress: "Monthly progress",
      completed: "Completed",
      planned: "planned",
      volumeWeek: "KM this week",
      volumeMonth: "KM this month",
      volumeYear: "KM this year",
      activeGroups: "Active groups",
      challenges: "Challenges completed",
      nextFocus: "Next focus",
      estimatedFromSessions: "Calculated from published sessions",
      premiumTitle: "Train with the full plan",
      premiumDescription: "Activate Premium for weekly planning, the full library and level-based content.",
      memberStatus: "Status",
      noVolume: "No volume defined"
    },
    pt: {
      dashboardEyebrow: "Dashboard",
      dashboardTitle: "A sua semana na agua",
      dashboardDescription: "Acompanhe sessoes, volume e desafios atribuidos pelo Supabase.",
      weeklyPlanTitle: "Plano Semanal",
      upgrade: "Upgrade para Premium",
      manageBilling: "Faturacao",
      weeklyProgress: "Progresso semanal",
      monthlyProgress: "Progresso mensal",
      completed: "Concluidas",
      planned: "planejadas",
      volumeWeek: "KM semana",
      volumeMonth: "KM mes",
      volumeYear: "KM ano",
      activeGroups: "Grupos ativos",
      challenges: "Desafios concluidos",
      nextFocus: "Proximo foco",
      estimatedFromSessions: "Calculado a partir de sessoes publicadas",
      premiumTitle: "Treine com o plano completo",
      premiumDescription: "Ative Premium para planejamento semanal, biblioteca completa e conteudo por nivel.",
      memberStatus: "Estado",
      noVolume: "Sem volume definido"
    }
  } as const;

  return copies[locale];
}

export function getPaymentCopy(locale: Locale) {
  const copies = {
    es: {
      selectedPlan: "Plan seleccionado",
      continueCheckout: "Continuar al pago",
      checkoutReadyTitle: "Pago Premium listo",
      checkoutReadyDescription:
        "El pago seguro se completa en Stripe y la suscripcion se sincroniza automaticamente al volver.",
      checkoutSuccess: "Pago recibido. La membresia Premium se actualizara en unos segundos.",
      checkoutCancelled: "Pago cancelado. Puedes reintentarlo cuando quieras."
    },
    en: {
      selectedPlan: "Selected plan",
      continueCheckout: "Continue to payment",
      checkoutReadyTitle: "Premium payment ready",
      checkoutReadyDescription: "Secure payment happens in Stripe and the subscription syncs automatically when you return.",
      checkoutSuccess: "Payment received. Premium membership will update in a few seconds.",
      checkoutCancelled: "Payment cancelled. You can try again whenever you are ready."
    },
    pt: {
      selectedPlan: "Plano selecionado",
      continueCheckout: "Continuar para pagamento",
      checkoutReadyTitle: "Pagamento Premium pronto",
      checkoutReadyDescription:
        "O pagamento seguro acontece na Stripe e a assinatura sincroniza automaticamente ao regressar.",
      checkoutSuccess: "Pagamento recebido. A assinatura Premium sera atualizada dentro de alguns segundos.",
      checkoutCancelled: "Pagamento cancelado. Pode tentar novamente quando quiser."
    }
  } as const;

  return copies[locale];
}

export function getOnboardingCopy(locale: Locale) {
  const copies = {
    es: {
      title: "Configura tu plan inicial",
      description: "Responde estas preguntas para asignarte el grupo y las dos primeras semanas de entrenamiento.",
      levelQuestion: "¿Cuál es tu nivel de natación?",
      goalQuestion: "¿Qué objetivo tienes planteado?",
      competitionQuestion: "¿Qué prueba tienes como objetivo?",
      submit: "Guardar y generar plan",
      recalibrate: "Guardar y recalibrar plan",
      saving: "Generando plan",
      success: "Perfil guardado. Cargando tus sesiones.",
      error: "No se pudo guardar el perfil inicial.",
      summaryTitle: "Perfil de entrenamiento",
      summaryDescription: "Tus respuestas actuales para calibrar el plan.",
      completedLabel: "Configurado",
      edit: "Editar respuestas",
      close: "Cerrar",
      lastUpdated: "Actualizado",
      levels: {
        principiante: "Principiante",
        intermedio: "Intermedio",
        avanzado: "Avanzado"
      },
      levelInfo: {
        title: "¿Qué nivel me corresponde?",
        intro: "El volumen por sesión depende de la zona de entrenamiento utilizada.",
        fields: { tecnica: "Técnica", experiencia: "Experiencia", ritmo: "Ritmo de nado", volumen: "Volumen por sesión" },
        principiante: {
          tecnica: "Nivel técnico bajo en natación",
          experiencia: "Poca o ninguna experiencia en piscina, aguas abiertas o triatlón",
          ritmo: "02:00 min o superior /100m",
          volumen: "Sesiones hasta ~2.000 m aprox."
        },
        intermedio: {
          tecnica: "Nivel técnico medio en natación",
          experiencia: "Buena experiencia en piscina, aguas abiertas o triatlón",
          ritmo: "Inferior a 02:00 min, hasta 1:30–1:20 /100m",
          volumen: "Sesiones hasta ~5.000 m aprox."
        },
        avanzado: {
          tecnica: "Nivel técnico muy alto en natación",
          experiencia: "Experto en piscina, aguas abiertas o triatlón",
          ritmo: "Entre 01:00 y 1:15 /100m",
          volumen: "Sesiones hasta ~8.000 m aprox."
        }
      },
      goals: {
        aprendizaje_salud: "Aprendizaje y salud",
        preparacion_competitiva: "Preparación competitiva"
      },
      competitionGoals: {
        triatlon_sprint_olimpico: "Triatlon sprint u olimpico",
        ironman_70_3: "Ironman o Ironman 70.3",
        oceanman_5k_10k: "Oceanman 5K o Oceanman 10K"
      }
    },
    en: {
      title: "Set up your initial plan",
      description: "Answer these questions so we can assign your group and first two training weeks.",
      levelQuestion: "What is your swimming level?",
      goalQuestion: "What goal do you have?",
      competitionQuestion: "Which event are you targeting?",
      submit: "Save and generate plan",
      recalibrate: "Save and recalibrate plan",
      saving: "Generating plan",
      success: "Profile saved. Loading your sessions.",
      error: "Could not save the initial profile.",
      summaryTitle: "Training profile",
      summaryDescription: "Your current answers for plan calibration.",
      completedLabel: "Configured",
      edit: "Edit answers",
      close: "Close",
      lastUpdated: "Updated",
      levels: {
        principiante: "Beginner",
        intermedio: "Intermediate",
        avanzado: "Advanced"
      },
      levelInfo: {
        title: "Which level fits me?",
        intro: "Volume per session depends on the training zone used.",
        fields: { tecnica: "Technique", experiencia: "Experience", ritmo: "Swim pace", volumen: "Volume per session" },
        principiante: {
          tecnica: "Low technical level in swimming",
          experiencia: "Little or no experience in pool, open water or triathlon",
          ritmo: "02:00 min or slower /100m",
          volumen: "Sessions up to ~2,000 m approx."
        },
        intermedio: {
          tecnica: "Medium technical level in swimming",
          experiencia: "Good experience in pool, open water or triathlon",
          ritmo: "Under 02:00 min, down to 1:30–1:20 /100m",
          volumen: "Sessions up to ~5,000 m approx."
        },
        avanzado: {
          tecnica: "Very high technical level in swimming",
          experiencia: "Expert in pool, open water or triathlon",
          ritmo: "Between 01:00 and 1:15 /100m",
          volumen: "Sessions up to ~8,000 m approx."
        }
      },
      goals: {
        aprendizaje_salud: "Learning and health",
        preparacion_competitiva: "Competitive preparation"
      },
      competitionGoals: {
        triatlon_sprint_olimpico: "Sprint or Olympic triathlon",
        ironman_70_3: "Ironman or Ironman 70.3",
        oceanman_5k_10k: "Oceanman 5K or Oceanman 10K"
      }
    },
    pt: {
      title: "Configure o seu plano inicial",
      description: "Responda estas perguntas para atribuirmos o grupo e as duas primeiras semanas de treino.",
      levelQuestion: "Qual e o seu nivel de natacao?",
      goalQuestion: "Qual objetivo pretende atingir?",
      competitionQuestion: "Qual prova tem como objetivo?",
      submit: "Guardar e gerar plano",
      recalibrate: "Guardar e recalibrar plano",
      saving: "Gerando plano",
      success: "Perfil guardado. Carregando as suas sessoes.",
      error: "Nao foi possivel guardar o perfil inicial.",
      summaryTitle: "Perfil de treino",
      summaryDescription: "As suas respostas atuais para calibrar o plano.",
      completedLabel: "Configurado",
      edit: "Editar respostas",
      close: "Fechar",
      lastUpdated: "Atualizado",
      levels: {
        principiante: "Principiante",
        intermedio: "Intermedio",
        avanzado: "Avancado"
      },
      levelInfo: {
        title: "Que nivel me corresponde?",
        intro: "O volume por sessao depende da zona de treino utilizada.",
        fields: { tecnica: "Tecnica", experiencia: "Experiencia", ritmo: "Ritmo de nado", volumen: "Volume por sessao" },
        principiante: {
          tecnica: "Nivel tecnico baixo na natacao",
          experiencia: "Pouca ou nenhuma experiencia em piscina, aguas abertas ou triatlo",
          ritmo: "02:00 min ou superior /100m",
          volumen: "Sessoes ate ~2.000 m aprox."
        },
        intermedio: {
          tecnica: "Nivel tecnico medio na natacao",
          experiencia: "Boa experiencia em piscina, aguas abertas ou triatlo",
          ritmo: "Inferior a 02:00 min, ate 1:30–1:20 /100m",
          volumen: "Sessoes ate ~5.000 m aprox."
        },
        avanzado: {
          tecnica: "Nivel tecnico muito alto na natacao",
          experiencia: "Especialista em piscina, aguas abertas ou triatlo",
          ritmo: "Entre 01:00 e 1:15 /100m",
          volumen: "Sessoes ate ~8.000 m aprox."
        }
      },
      goals: {
        aprendizaje_salud: "Aprendizagem e saude",
        preparacion_competitiva: "Preparacao competitiva"
      },
      competitionGoals: {
        triatlon_sprint_olimpico: "Triatlo sprint ou olimpico",
        ironman_70_3: "Ironman ou Ironman 70.3",
        oceanman_5k_10k: "Oceanman 5K ou Oceanman 10K"
      }
    }
  } as const;

  return copies[locale];
}

export function getTrainingViewCopy(locale: Locale) {
  const copies = {
    es: {
      all: "Todo",
      general: "General",
      groups: "Grupos",
      currentWeek: "Semana actual",
      weekRange: "Semana",
      mondayStart: "Inicio lunes",
      noSessionsForView: "No hay sesiones publicadas para esta vista.",
      scope: {
        portal: "General",
        premium: "Premium",
        group: "Grupo"
      }
    },
    en: {
      all: "All",
      general: "General",
      groups: "Groups",
      currentWeek: "Current week",
      weekRange: "Week",
      mondayStart: "Monday start",
      noSessionsForView: "There are no published sessions for this view.",
      scope: {
        portal: "General",
        premium: "Premium",
        group: "Group"
      }
    },
    pt: {
      all: "Tudo",
      general: "Geral",
      groups: "Grupos",
      currentWeek: "Semana atual",
      weekRange: "Semana",
      mondayStart: "Inicio segunda-feira",
      noSessionsForView: "Não há sessões publicadas para esta vista.",
      scope: {
        portal: "Geral",
        premium: "Premium",
        group: "Grupo"
      }
    }
  } as const;

  return copies[locale];
}

export function getCompletionCopy(locale: Locale) {
  const copies = {
    es: {
      markDone: "Confirmar realizada",
      done: "Sesion completada",
      saving: "Guardando",
      completedBadge: "Realizada"
    },
    en: {
      markDone: "Confirm completed",
      done: "Session completed",
      saving: "Saving",
      completedBadge: "Done"
    },
    pt: {
      markDone: "Confirmar realizada",
      done: "Sessao concluida",
      saving: "Guardando",
      completedBadge: "Realizada"
    }
  } as const;

  return copies[locale];
}

export function getChallengeCopy(locale: Locale) {
  const copies = {
    es: {
      title: "Desafíos",
      description: "Retos persistentes fuera del plan semanal. Permanecen activos hasta completar todas sus sesiones.",
      progress: "Progreso",
      sessions: "sesiones",
      persistent: "Reto persistente",
      active: "Activo",
      completed: "Completado"
    },
    en: {
      title: "Challenges",
      description: "Persistent challenges outside the weekly plan. They stay active until every session is completed.",
      progress: "Progress",
      sessions: "sessions",
      persistent: "Persistent challenge",
      active: "Active",
      completed: "Completed"
    },
    pt: {
      title: "Desafios",
      description: "Desafios persistentes fora do plano semanal. Permanecem ativos ate concluir todas as sessoes.",
      progress: "Progresso",
      sessions: "sessoes",
      persistent: "Desafio persistente",
      active: "Ativo",
      completed: "Concluido"
    }
  } as const;

  return copies[locale];
}

export function getPerformanceCopy(locale: Locale) {
  const copies = {
    es: {
      title: "Ritmos y tests",
      description: "Guarda tus marcas y revisa la progresion historica.",
      dateLabel: "Fecha",
      save: "Guardar",
      saving: "Guardando",
      maximize: "Maximizar",
      close: "Cerrar",
      history: "Historico",
      empty: "Aun no hay mediciones guardadas.",
      invalid: "Introduce un tiempo valido en formato m:ss.",
      latest: "Ultima marca",
      best: "Mejor marca",
      points: "mediciones",
      registrationMonth: "Mes desde registro",
      measurementDate: "Fecha de medicion",
      cssZones: {
        title: "Tus ritmos por zona (método CSS)",
        subtitle: "Calculados con tus tests de 200m y 400m",
        missing: "Guarda un test de 200m y otro de 400m para calcular tus ritmos por zona.",
        invalid: "Revisa tus tests: el tiempo de 400m debe ser mayor que el de 200m.",
        cssLabel: "Velocidad critica (CSS)",
        per100: "/100m",
        zoneNames: { z1: "Aerobico ligero (AEL)", z2: "Aerobico medio (AEM)", z3: "Aerobico intenso (AEI)" },
        zoneHints: { z1: "CSS +10 a +20 s", z2: "CSS +7 a +10 s", z3: "A ritmo CSS" },
        legend: "Z3 es tu velocidad critica: CSS = (tiempo 400m − tiempo 200m) ÷ 2 por cada 100m. Z2 y Z1 se estiman sumando segundos por 100m segun el cuadro de zonas Best Swim. Repite ambos tests descansado y a maximo esfuerzo para recalibrar."
      },
      metrics: {
        pace_100m: {
          title: "100m",
          shortTitle: "100m",
          description: "Eje X por fecha de medicion. Eje Y fijo de 1:00 a 2:20/100m.",
          valueLabel: "Ritmo 100m",
          placeholder: "1:40"
        },
        test_200m: {
          title: "Test 200m",
          shortTitle: "200m",
          description: "Eje X por fecha de medicion. Eje Y fijo de 2:00 a 5:00.",
          valueLabel: "Tiempo 200m",
          placeholder: "3:20"
        },
        test_400m: {
          title: "Test 400m",
          shortTitle: "400m",
          description: "Eje X por fecha de medicion. Eje Y fijo de 4:00 a 10:00.",
          valueLabel: "Tiempo 400m",
          placeholder: "7:10"
        }
      }
    },
    en: {
      title: "Paces and tests",
      description: "Save your marks and review historical progression.",
      dateLabel: "Date",
      save: "Save",
      saving: "Saving",
      maximize: "Maximize",
      close: "Close",
      history: "History",
      empty: "No measurements saved yet.",
      invalid: "Enter a valid time using m:ss format.",
      latest: "Latest mark",
      best: "Best mark",
      points: "measurements",
      registrationMonth: "Month from registration",
      measurementDate: "Measurement date",
      cssZones: {
        title: "Your paces by zone (CSS method)",
        subtitle: "Calculated from your 200m and 400m tests",
        missing: "Save one 200m test and one 400m test to calculate your zone paces.",
        invalid: "Check your tests: the 400m time must be greater than the 200m time.",
        cssLabel: "Critical swim speed (CSS)",
        per100: "/100m",
        zoneNames: { z1: "Light aerobic (AEL)", z2: "Medium aerobic (AEM)", z3: "Intense aerobic (AEI)" },
        zoneHints: { z1: "CSS +10 to +20 s", z2: "CSS +7 to +10 s", z3: "At CSS pace" },
        legend: "Z3 is your critical speed: CSS = (400m time − 200m time) ÷ 2 per 100m. Z2 and Z1 are estimated by adding seconds per 100m following the Best Swim zone chart. Repeat both tests rested and at maximum effort to recalibrate."
      },
      metrics: {
        pace_100m: {
          title: "100m",
          shortTitle: "100m",
          description: "X axis by measurement date. Fixed Y axis from 1:00 to 2:20/100m.",
          valueLabel: "100m pace",
          placeholder: "1:40"
        },
        test_200m: {
          title: "200m test",
          shortTitle: "200m",
          description: "X axis by measurement date. Fixed Y axis from 2:00 to 5:00.",
          valueLabel: "200m time",
          placeholder: "3:20"
        },
        test_400m: {
          title: "400m test",
          shortTitle: "400m",
          description: "X axis by measurement date. Fixed Y axis from 4:00 to 10:00.",
          valueLabel: "400m time",
          placeholder: "7:10"
        }
      }
    },
    pt: {
      title: "Ritmos e testes",
      description: "Guarde as suas marcas e veja a progressao historica.",
      dateLabel: "Data",
      save: "Guardar",
      saving: "Guardando",
      maximize: "Maximizar",
      close: "Fechar",
      history: "Historico",
      empty: "Ainda nao ha medicoes guardadas.",
      invalid: "Introduza um tempo valido no formato m:ss.",
      latest: "Ultima marca",
      best: "Melhor marca",
      points: "medicoes",
      registrationMonth: "Mes desde o registo",
      measurementDate: "Data da medicao",
      cssZones: {
        title: "Os teus ritmos por zona (metodo CSS)",
        subtitle: "Calculados com os teus testes de 200m e 400m",
        missing: "Guarda um teste de 200m e outro de 400m para calcular os teus ritmos por zona.",
        invalid: "Revisa os teus testes: o tempo de 400m deve ser maior que o de 200m.",
        cssLabel: "Velocidade critica (CSS)",
        per100: "/100m",
        zoneNames: { z1: "Aerobico ligeiro (AEL)", z2: "Aerobico medio (AEM)", z3: "Aerobico intenso (AEI)" },
        zoneHints: { z1: "CSS +10 a +20 s", z2: "CSS +7 a +10 s", z3: "Ao ritmo CSS" },
        legend: "Z3 e a tua velocidade critica: CSS = (tempo 400m − tempo 200m) ÷ 2 por cada 100m. Z2 e Z1 estimam-se somando segundos por 100m segundo o quadro de zonas Best Swim. Repete ambos os testes descansado e ao maximo esforco para recalibrar."
      },
      metrics: {
        pace_100m: {
          title: "100m",
          shortTitle: "100m",
          description: "Eixo X por data de medicao. Eixo Y fixo de 1:00 a 2:20/100m.",
          valueLabel: "Ritmo 100m",
          placeholder: "1:40"
        },
        test_200m: {
          title: "Teste 200m",
          shortTitle: "200m",
          description: "Eixo X por data de medicao. Eixo Y fixo de 2:00 a 5:00.",
          valueLabel: "Tempo 200m",
          placeholder: "3:20"
        },
        test_400m: {
          title: "Teste 400m",
          shortTitle: "400m",
          description: "Eixo X por data de medicao. Eixo Y fixo de 4:00 a 10:00.",
          valueLabel: "Tempo 400m",
          placeholder: "7:10"
        }
      }
    }
  } as const;

  return copies[locale];
}

export function getProgressCopy(locale: Locale) {
  const copies = {
    es: {
      title: "Tu progreso",
      description: "Metricas visuales de tu entrenamiento: volumen, tipo de trabajo, constancia y velocidad critica.",
      weekly: {
        title: "Volumen semanal",
        subtitle: "Metros completados en las ultimas 8 semanas",
        empty: "Completa sesiones para ver tu volumen semanal."
      },
      zones: {
        title: "Distribucion por tipo de trabajo",
        subtitle: "Metros por zona en las sesiones completadas",
        labels: { ael: "AEL", aem: "AEM", reto: "Reto", aei: "AEI", tecnica: "Tecnica" },
        empty: "Completa sesiones para ver tu distribucion por zonas."
      },
      calendar: {
        title: "Constancia",
        subtitle: "Ultimas 16 semanas",
        currentStreak: "Racha actual",
        bestStreak: "Mejor racha",
        activeDays: "Dias activos",
        days: "dias",
        empty: "Tus dias de entrenamiento apareceran aqui."
      },
      cssTrend: {
        title: "Evolucion de tu velocidad critica (CSS)",
        subtitle: "Cada punto combina tus tests de 200m y 400m mas recientes",
        empty: "Guarda tests de 200m y 400m en fechas distintas para ver tu evolucion.",
        legendLine: "CSS",
        legendNote: "Bandas de referencia segun tu CSS actual: mas abajo = mas rapido."
      }
    },
    en: {
      title: "Your progress",
      description: "Visual training metrics: volume, work type, consistency and critical speed.",
      weekly: {
        title: "Weekly volume",
        subtitle: "Meters completed over the last 8 weeks",
        empty: "Complete sessions to see your weekly volume."
      },
      zones: {
        title: "Work type distribution",
        subtitle: "Meters by zone across completed sessions",
        labels: { ael: "AEL", aem: "AEM", reto: "Challenge", aei: "AEI", tecnica: "Technique" },
        empty: "Complete sessions to see your zone distribution."
      },
      calendar: {
        title: "Consistency",
        subtitle: "Last 16 weeks",
        currentStreak: "Current streak",
        bestStreak: "Best streak",
        activeDays: "Active days",
        days: "days",
        empty: "Your training days will appear here."
      },
      cssTrend: {
        title: "Critical swim speed (CSS) trend",
        subtitle: "Each point combines your most recent 200m and 400m tests",
        empty: "Save 200m and 400m tests on different dates to see your trend.",
        legendLine: "CSS",
        legendNote: "Reference bands from your current CSS: lower = faster."
      }
    },
    pt: {
      title: "O teu progresso",
      description: "Metricas visuais do treino: volume, tipo de trabalho, constancia e velocidade critica.",
      weekly: {
        title: "Volume semanal",
        subtitle: "Metros completados nas ultimas 8 semanas",
        empty: "Completa sessoes para ver o teu volume semanal."
      },
      zones: {
        title: "Distribuicao por tipo de trabalho",
        subtitle: "Metros por zona nas sessoes completadas",
        labels: { ael: "AEL", aem: "AEM", reto: "Desafio", aei: "AEI", tecnica: "Tecnica" },
        empty: "Completa sessoes para ver a tua distribuicao por zonas."
      },
      calendar: {
        title: "Constancia",
        subtitle: "Ultimas 16 semanas",
        currentStreak: "Sequencia atual",
        bestStreak: "Melhor sequencia",
        activeDays: "Dias ativos",
        days: "dias",
        empty: "Os teus dias de treino aparecerao aqui."
      },
      cssTrend: {
        title: "Evolucao da velocidade critica (CSS)",
        subtitle: "Cada ponto combina os teus testes de 200m e 400m mais recentes",
        empty: "Guarda testes de 200m e 400m em datas diferentes para ver a evolucao.",
        legendLine: "CSS",
        legendNote: "Bandas de referencia segundo a tua CSS atual: mais abaixo = mais rapido."
      }
    }
  } as const;

  return copies[locale];
}
