import { describe, expect, it } from "vitest";
import { decodeRuns, encodeRuns, formatNumber, templateKey, translatePlain, translateRuns } from "./content-i18n.mjs";

describe("encodeRuns / decodeRuns", () => {
  it("ida y vuelta conserva texto y formato", () => {
    const runs = [{ text: "4x100m " }, { text: "crol", bold: true }, { text: " en " }, { text: "AEI", color: "#F79646" }];
    const { markup, styles } = encodeRuns(runs);
    expect(markup).toBe("4x100m ⟦1⟧crol⟦/1⟧ en ⟦2⟧AEI⟦/2⟧");
    expect(decodeRuns(markup, styles)).toEqual(runs);
  });

  it("reutiliza el mismo índice para el mismo estilo", () => {
    expect(encodeRuns([{ text: "a", bold: true }, { text: " y " }, { text: "b", bold: true }]).markup).toBe("⟦1⟧a⟦/1⟧ y ⟦1⟧b⟦/1⟧");
  });

  it("une los trozos contiguos con el mismo estilo", () => {
    const runs = [{ text: "¡¡", bold: true }, { text: " ", bold: true }, { text: "descansa", bold: true }, { text: " ya" }];
    expect(encodeRuns(runs).markup).toBe("⟦1⟧¡¡ descansa⟦/1⟧ ya");
  });

  it("no pierde texto con marcas desemparejadas", () => {
    expect(decodeRuns("hola ⟦1⟧mundo", [{ bold: true }]).map((r) => r.text).join("")).toBe("hola mundo");
  });
});

describe("cifras", () => {
  it("las saca de la clave: misma entrada para distintos metros", () => {
    expect(templateKey("COOL DOWN: 200m")).toBe(templateKey("COOL DOWN: 500m"));
    expect(templateKey("WARM UP:   1.000m")).toBe("WARM UP: ⟨0⟩m");
  });

  it("no toma por cifra el dígito de un código de zona", () => {
    expect(templateKey("4x100m en VO2max y Z3")).toBe("⟨0⟩x⟨1⟩m en VO2max y Z3");
  });

  it("en inglés el punto de miles pasa a coma y el decimal a punto", () => {
    expect(formatNumber("4.500", "en")).toBe("4,500");
    expect(formatNumber("12,5", "en")).toBe("12.5");
    expect(formatNumber("12.5", "en")).toBe("12.5");
    expect(formatNumber("4.500", "pt")).toBe("4.500");
  });
});

describe("translateRuns", () => {
  const en = {
    "Volumen sesión: ⟨0⟩m": "Session volume: ⟨0⟩m",
    "⟨0⟩x⟨1⟩m ⟦1⟧crol⟦/1⟧ suave": "⟨0⟩x⟨1⟩m easy ⟦1⟧freestyle⟦/1⟧"
  };

  it("traduce, rellena cifras y reordena el formato", () => {
    const out = translateRuns([{ text: "4x100m " }, { text: "crol", bold: true }, { text: " suave" }], en, "en");
    expect(out).toEqual([{ text: "4x100m easy " }, { text: "freestyle", bold: true }]);
  });

  it("formatea las cifras al idioma", () => {
    expect(translatePlain("Volumen sesión: 4.500m", en, "en")).toBe("Session volume: 4,500m");
  });

  it("devuelve null si no está en el diccionario", () => {
    expect(translatePlain("Texto sin traducir", en, "en")).toBeNull();
  });
});
