const HTML_TAG_RE = /<[^>]*>/g;

export function sanitizeText(input: string, maxLength: number): string {
  return input.replace(HTML_TAG_RE, "").trim().slice(0, maxLength);
}
