export type RichRun = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  background?: string;
};

export type ParagraphBlock = {
  type: "paragraph";
  text: string;
  runs: RichRun[];
  variant?: "title" | "heading" | "subheading" | "note" | "body";
};

export type TableCell = {
  text: string;
  runs: RichRun[];
  background?: string;
};

export type TableBlock = {
  type: "table";
  rows: TableCell[][];
};

export type ContentBlock = ParagraphBlock | TableBlock;

export type ImportedDocument = {
  id: string;
  title: string;
  sourcePath: string;
  categoryPath: string[];
  blocks: ContentBlock[];
  summary: string;
  total?: string;
};

export type ImportedSection = {
  id: string;
  title: string;
  description: string;
  href: string;
  documents: ImportedDocument[];
  groups: Array<{
    id: string;
    title: string;
    documents: ImportedDocument[];
  }>;
};

export type ImportedChallenge = {
  id: string;
  title: string;
  href: string;
  distance?: string;
  level?: string;
  image?: string | null;
  intro?: ImportedDocument;
  sessions: ImportedDocument[];
};
