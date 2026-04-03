import OpenAI from "openai";
import { IUserInfo } from "../../interfaces/IUserInfoResponse";
import { WritingAnalysis } from "../writing/writingSchema";
import {
  Conversation,
  ConversationCreateParams,
} from "openai/resources/conversations/conversations";
import { IJobInfo } from "../../interfaces/IJobInfo";

function truncateWritingSample(
  text: string,
  maxSentences = 4,
  maxChars = 1000,
): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const sentenceMatches = normalized.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [];
  const sentenceLimited =
    sentenceMatches.length > 0
      ? sentenceMatches.slice(0, maxSentences).join(" ").trim()
      : normalized;

  if (sentenceLimited.length <= maxChars) {
    return sentenceLimited;
  }

  const cut = sentenceLimited.slice(0, maxChars);

  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > Math.floor(maxChars * 0.8)) {
    return `${cut.slice(0, lastSpace).trim()}...`;
  }

  return `${cut.trim()}...`;
}

export async function createConversation(
  clientOpenAI: OpenAI,
  userData: IUserInfo,
  jobData: IJobInfo,
  writingAnalysis: WritingAnalysis | null,
  writingSample: string | null,
): Promise<string> {
  const items: ConversationCreateParams["items"] = [
    {
      type: "message",
      role: "system",
      content: [
        { type: "input_text", text: "USER_DATA:" },
        { type: "input_text", text: JSON.stringify(userData) },
      ],
    },
    {
      type: "message",
      role: "system",
      content: [
        { type: "input_text", text: "JOB_DATA:" },
        { type: "input_text", text: JSON.stringify(jobData) },
      ],
    },
  ];

  // Optional writing analysis
  if (writingAnalysis !== null) {
    items.push({
      type: "message",
      role: "system",
      content: [
        { type: "input_text", text: "WRITING_ANALYSIS:" },
        { type: "input_text", text: JSON.stringify(writingAnalysis) },
      ],
    });
  }

  if (writingSample !== null) {
    const truncated = truncateWritingSample(writingSample);
    items.push({
      type: "message",
      role: "system",
      content: [
        { type: "input_text", text: "WRITING_SAMPLE:" },
        { type: "input_text", text: JSON.stringify(truncated.trim()) },
      ],
    });
  }

  const conversation: Conversation = await clientOpenAI.conversations.create({
    metadata: { topic: "cover_letter_pipeline" },
    items: items,
  });

  return conversation.id;
}

export async function storeLatestDraft(
  clientOpenAI: OpenAI,
  conversationId: string,
  draft: string,
) {
  // Store marked draft — model will use only this message
  await clientOpenAI.conversations.items.create(conversationId, {
    items: [
      {
        type: "message",
        role: "user",
        content: [
          { type: "input_text", text: "LATEST_DRAFT:" },
          { type: "input_text", text: draft },
        ],
      },
    ],
  });
}
