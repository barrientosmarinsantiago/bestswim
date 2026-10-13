import type { RichRun } from "./types";

export type ContentDictionary = Record<string, string>;
type Style = Partial<Pick<RichRun, "bold" | "italic" | "underline" | "color" | "background">>;

export function encodeRuns(runs: RichRun[]): { markup: string; styles: Style[] };
export function decodeRuns(markup: string, styles: Style[]): RichRun[];
export function toTemplate(text: string): { template: string; numbers: string[] };
export function formatNumber(value: string, locale: string): string;
export function fillTemplate(template: string, numbers: string[], locale: string): string;
export function templateKey(text: string): string;
export function translateRuns(runs: RichRun[], dictionary: ContentDictionary, locale: string): RichRun[] | null;
export function translatePlain(text: string, dictionary: ContentDictionary, locale: string): string | null;
