export default function cleanLLMOutput(raw: string): string {
  return raw
    .replace(/^\s*```json\s*/i, "")
    .replace(/^\s*```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}
