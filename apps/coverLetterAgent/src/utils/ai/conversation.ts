import OpenAI from "openai";
import { ITheirStackJob } from "../../interfaces/ITheirStackResponse";
import { IUserInfo } from "../../interfaces/IUserInfoResponse";
import { WritingAnalysis } from "../writing/writingSchema";
import {
  Conversation,
  ConversationCreateParams,
} from "openai/resources/conversations/conversations";

export async function createConversation(
  clientOpenAI: OpenAI,
  userData: IUserInfo,
  jobData: ITheirStackJob,
  writingAnalysis: WritingAnalysis | null,
  writingSample: string | null
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
    items.push({
      type: "message",
      role: "system",
      content: [
        { type: "input_text", text: "WRITING_SAMPLE:" },
        { type: "input_text", text: JSON.stringify(writingSample.trim()) },
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
  draft: string
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
