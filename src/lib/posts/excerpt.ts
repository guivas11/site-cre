type ParsedExcerpt = {
  text: string;
  sourceUrl: string | null;
  paragraphs: string[];
};

function splitParagraphs(text: string): string[] {
  const normalized = text.replace(/\r/g, "").trim();
  if (!normalized) return [];

  const byNewline = normalized
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (byNewline.length > 1) return byNewline;

  const sentences = normalized.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 2) return [normalized];

  const groups: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    groups.push(sentences.slice(i, i + 2).join(" ").trim());
  }
  return groups.filter(Boolean);
}

export function parsePostExcerpt(rawValue?: string | null): ParsedExcerpt {
  const raw = String(rawValue ?? "")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .trim();

  if (!raw) {
    return { text: "", sourceUrl: null, paragraphs: [] };
  }

  const sourceRegex = /(?:^|\n)\s*Fonte:\s*(https?:\/\/\S+)/i;
  const sourceMatch = raw.match(sourceRegex);
  const sourceUrl = sourceMatch?.[1] ?? null;
  const textWithoutSource = raw
    .replace(sourceRegex, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const safeText = textWithoutSource || raw;
  return {
    text: safeText,
    sourceUrl,
    paragraphs: splitParagraphs(safeText),
  };
}
