const INSIGHT_OBJECT_KEYS = [
  "insight",
  "recommendation",
  "text",
  "title",
  "message",
  "description",
  "content",
] as const;

const INSIGHT_ARRAY_KEYS = [
  "insights",
  "recommendations",
  "items",
  "data",
  "results",
] as const;

function stripCodeBlocks(text: string): string {
  return text
    .replace(/```(?:json|javascript|js|txt)?\s*([\s\S]*?)```/gi, "$1")
    .replace(/```/g, "")
    .trim();
}

function cleanInsightText(text: string): string {
  return text
    .replace(/^\s*\d+[.)]\s+/, "")
    .replace(/^\s*[-*•]\s+/, "")
    .replace(/^["']+|["']+$/g, "")
    .replace(/\\n/g, " ")
    .trim();
}

function isReadableInsight(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (trimmed === "[" || trimmed === "]" || trimmed === "{" || trimmed === "}") {
    return false;
  }
  if (/^[\{\}\[\]\s,:"'`\\]+$/.test(trimmed)) return false;
  if (/^```/.test(trimmed)) return false;
  return true;
}

function dedupeInsights(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function collectStringsFromUnknown(value: unknown): string[] {
  if (typeof value === "string") {
    const cleaned = cleanInsightText(value);
    return isReadableInsight(cleaned) ? [cleaned] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectStringsFromUnknown(item));
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const fromKnownKeys: string[] = [];

    for (const key of INSIGHT_ARRAY_KEYS) {
      if (key in record) {
        fromKnownKeys.push(...collectStringsFromUnknown(record[key]));
      }
    }

    for (const key of INSIGHT_OBJECT_KEYS) {
      if (typeof record[key] === "string") {
        fromKnownKeys.push(...collectStringsFromUnknown(record[key]));
      }
    }

    if (fromKnownKeys.length > 0) {
      return fromKnownKeys;
    }

    return Object.values(record).flatMap((entry) =>
      typeof entry === "string" || Array.isArray(entry) || (entry && typeof entry === "object")
        ? collectStringsFromUnknown(entry)
        : [],
    );
  }

  return [];
}

function tryParseJson(text: string): string[] | null {
  const candidates = [text];
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) candidates.push(arrayMatch[0]);
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) candidates.push(objectMatch[0]);

  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      const extracted = dedupeInsights(
        collectStringsFromUnknown(parsed).map(cleanInsightText).filter(isReadableInsight),
      );
      if (extracted.length > 0) return extracted;
    } catch {
      // try next candidate
    }
  }

  return null;
}

function parseNumberedList(text: string): string[] {
  const matches = [...text.matchAll(/^\s*\d+[.)]\s+(.+)$/gm)];
  if (matches.length === 0) return [];

  return dedupeInsights(
    matches
      .map((match) => cleanInsightText(match[1] ?? ""))
      .filter(isReadableInsight),
  );
}

function parseByNewlines(text: string): string[] {
  return dedupeInsights(
    text
      .split(/\r?\n+/)
      .map((line) => cleanInsightText(line))
      .filter(isReadableInsight),
  );
}

/**
 * Normalizes Gemini/LLM insight responses into human-readable strings.
 */
export function parseInsights(rawText: string): string[] {
  const text = stripCodeBlocks(rawText.trim());
  if (!text) return [];

  const fromJson = tryParseJson(text);
  if (fromJson && fromJson.length > 0) return fromJson;

  const fromNumbered = parseNumberedList(text);
  if (fromNumbered.length > 0) return fromNumbered;

  const fromLines = parseByNewlines(text);
  if (fromLines.length > 0) return fromLines;

  const fallback = cleanInsightText(text.replace(/\r?\n+/g, " "));
  if (isReadableInsight(fallback)) return [fallback];

  return [];
}
