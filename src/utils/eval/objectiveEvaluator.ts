import { IObjectiveEvaluationResult } from "../../interfaces/IEvaluator";
import { ITheirStackJob } from "../../interfaces/ITheirStackResponse";
import { IUserInfo } from "../../interfaces/IUserInfoResponse";
import { WritingAnalysis } from "../writing/writingSchema";

export async function objectiveEvaluator(
  draft: string,
  userData: IUserInfo,
  jobData: ITheirStackJob,
  writingAnalysis: WritingAnalysis
): Promise<IObjectiveEvaluationResult> {
  const issues: string[] = [];

  // Trim + normalize
  const text = draft.trim();
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);

  const wordCount = words.length;
  const paragraphCount = paragraphs.length;
  const avgSentenceLength =
    sentences.length > 0 ? wordCount / sentences.length : 0;
  const longSentenceCount = sentences.filter(
    (s) => s.split(/\s+/).length > 30
  ).length;

  // Must include greeting
  const greetingMatch = text.match(/Dear\s+([^,]+),/i);
  if (!greetingMatch) {
    issues.push("Missing greeting (must include 'Dear ...').");
  }

  // 2. HIRING-MANAGER NAME CHECK
  if (jobData.hiring_team && jobData.hiring_team.length > 0) {
    const possibleNames = jobData.hiring_team
      .flatMap((m) => {
        const names: string[] = [];
        if (m.full_name) {
          names.push(m.full_name);
          const parts = m.full_name.split(" ");
          parts.forEach((p) => names.push(p));
        }
        return names;
      })
      .filter(Boolean)
      .map((n) => n.toLowerCase());

    const greetingUsed = greetingMatch?.[1]
      ? greetingMatch[1].trim().toLowerCase()
      : null;

    if (greetingUsed) {
      // Must match one of the known names
      const matchesKnown = possibleNames.some((n) => greetingUsed.includes(n));
      if (!matchesKnown) {
        issues.push(
          `Greeting appears to not use available recruiter name. Expected one of: ${possibleNames.join(
            ", "
          )}`
        );
      }
    }
  }

  // Must end with user signature or closing phrase
  // Normalize newlines
  const normalized = text.replace(/\r\n/g, "\n");

  // Regex:
  // - "Sincerely," (with optional trailing spaces)
  // - 2 to 4 blank lines (newline groups)
  // - then the exact username (case-insensitive)
  const closingRegex = new RegExp(
    `Sincerely,\\s*(?:\\n\\s*){2,4}${userData.name.replace(
      /[.*+?^${}()|[\\]\\\\]/g,
      "\\$&"
    )}`,
    "i"
  );

  if (!closingRegex.test(normalized)) {
    issues.push(
      `Closing format incorrect. Must be "Sincerely," followed by 2 - 4 blank lines, then "${userData.name}".`
    );
  }

  // Must have >= 3 paragraphs
  if (paragraphCount < 3) {
    issues.push("Too few paragraphs (must have at least 3).");
  }

  if (paragraphCount > 5) {
    issues.push("Too many paragraphs (must have at most 5)");
  }

  // LENGTH REQUIREMENTS
  if (wordCount < 250) {
    issues.push("Cover letter too short (must be at least 250 words).");
  }

  if (wordCount > 450) {
    issues.push("Cover letter too long (must be under 450 words).");
  }

  if (avgSentenceLength > 30) {
    issues.push("Average sentence length too high (should be under 30 words).");
  }

  if (longSentenceCount > 2) {
    issues.push("Contains too many overly long sentences (max 2 allowed).");
  }

  // DETECT CLICHE PHRASES TO AVOID - gotten from researching phrases to avoid
  const clichePhrases = [
    "to whom it may concern",
    "my name is",
    "i'm writing to apply",
    "ever since i was little",
    "ever since i was young",
    "since i was little",
    "since i was young",
    "as you can see on my resume",
    "as you see on my resume",
    "i'm the perfect fit",
    "excellent written and oral skills",
    "dream come true",
    "go-getter",
    "think outside the box",
    "self-starter",
    "detail-oriented",
    "the extra mile",
    "problem solver",
    "creative thinker",
    "Hey",
    "Hi",
    "Hello",
    "good communicator",
    "team player",
    "i will fix things",
    "i am writing to express my interest",
    "i believe i would be a great fit",
    "please consider my application",
    "i am passionate about",
    "i am excited to apply",
    "i'm excited to apply",
    "thank you for your time and consideration",
  ];

  for (const phrase of clichePhrases) {
    if (text.toLowerCase().includes(phrase)) {
      issues.push(`Contains generic cliche phrase: "${phrase}"`);
    }
  }

  return {
    pass: issues.length === 0,
    issues,
    stats: {
      wordCount,
      paragraphCount,
      avgSentenceLength,
      longSentenceCount,
    },
  };
}
