import OpenAI from "openai";
import "dotenv/config";

export default function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
}
