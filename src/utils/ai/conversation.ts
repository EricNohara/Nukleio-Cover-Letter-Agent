import OpenAI from "openai";
import { ITheirStackJob } from "../../interfaces/ITheirStackResponse";
import { IUserInfo } from "../../interfaces/IUserInfoResponse";
import { WritingAnalysis } from "../writing/writingSchema";
import {
  Conversation,
  ConversationCreateParams,
} from "openai/resources/conversations/conversations";

export default async function createConversation(
  clientOpenAI: OpenAI,
  userData: IUserInfo,
  jobData: ITheirStackJob,
  writingAnalysis: WritingAnalysis | null
): Promise<string> {
  const items: ConversationCreateParams["items"] = [
    {
      type: "message",
      role: "system",
      content: [
        { type: "input_text", text: "User data:" },
        { type: "input_text", text: JSON.stringify(userData) },
      ],
    },
    {
      type: "message",
      role: "system",
      content: [
        { type: "input_text", text: "Job data:" },
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
        { type: "input_text", text: "Writing analysis:" },
        { type: "input_text", text: JSON.stringify(writingAnalysis) },
      ],
    });
  }

  const conversation: Conversation = await clientOpenAI.conversations.create({
    metadata: { topic: "cover_letter_pipeline" },
    items: items,
  });

  return conversation.id;
}
