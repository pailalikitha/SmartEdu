export function parseJsonStringArray(text: string): string[] {
  const trimmed = text.trim();
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }
  } catch {
    // fall through
  }

  const match = trimmed.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed: unknown = JSON.parse(match[0]);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item));
      }
    } catch {
      // fall through
    }
  }

  return trimmed
    .split("\n")
    .map((line) => line.replace(/^[\d.\-*•]+\s*/, "").trim())
    .filter(Boolean);
}
