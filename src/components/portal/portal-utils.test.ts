import { describe, expect, it } from "vitest";
import type { PortalTrainingSession } from "./portal-types";
import { getPlanHorizonWeeks, getWeekIndexFromOnboarding, resolveOnboardingSessionDate } from "./portal-utils";

const planSession = (week: number, day: number) =>
  ({
    id: `w${week}d${day}`,
    session_date: "2026-01-19",
    tags: ["plan-semanal", `plan-week-${week}`, `plan-day-${day}`, "principiante"]
  }) as unknown as PortalTrainingSession;

// Alta un miércoles: la semana del cliente empieza el lunes 5 de octubre de 2026.
const ONBOARDING = "2026-10-07T10:00:00";
const at = (date: string) => new Date(`${date}T12:00:00`);

describe("plan semanal en el portal", () => {
  it("calcula el horizonte a partir de las etiquetas plan-week", () => {
    expect(getPlanHorizonWeeks([planSession(3, 1), planSession(14, 6), planSession(9, 3)])).toBe(12);
    expect(getPlanHorizonWeeks([])).toBe(0);
  });

  it("coloca la semana 3 del plan dos semanas después de la de alta", () => {
    expect(resolveOnboardingSessionDate(planSession(3, 1), ONBOARDING, 12, at("2026-10-19"))).toBe("2026-10-19");
    expect(resolveOnboardingSessionDate(planSession(3, 6), ONBOARDING, 12, at("2026-10-19"))).toBe("2026-10-24");
    expect(resolveOnboardingSessionDate(planSession(14, 3), ONBOARDING, 12, at("2026-10-19"))).toBe("2027-01-06");
  });

  it("vuelve a empezar el plan al acabar el horizonte", () => {
    // Semana 15 desde el alta = primera semana del segundo ciclo (plan-week-3 otra vez).
    const today = at("2027-01-11");
    expect(getWeekIndexFromOnboarding(ONBOARDING, today)).toBe(14);
    expect(resolveOnboardingSessionDate(planSession(3, 1), ONBOARDING, 12, today)).toBe("2027-01-11");
  });

  it("deja la fecha original sin alta o sin horizonte", () => {
    expect(resolveOnboardingSessionDate(planSession(3, 1), null, 12)).toBe("2026-01-19");
    expect(resolveOnboardingSessionDate(planSession(3, 1), ONBOARDING, 0)).toBe("2026-01-19");
  });

  it("cuenta las semanas aunque haya cambio de hora por medio", () => {
    // El 25 de octubre de 2026 se atrasa la hora en España: esa semana dura una hora más.
    expect(getWeekIndexFromOnboarding(ONBOARDING, at("2026-10-26"))).toBe(3);
  });
});
