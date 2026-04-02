import fs from "fs";
import path from "path";
import firstDraftAgent from "../agents/firstDraftAgent";
import { WritingAnalysis } from "../utils/writing/writingSchema";
import getOpenAIClient from "../utils/ai/getOpenAIClient";

function loadJSON<T>(file: string): T {
  const fullPath = path.join(__dirname, "../../testData", file);
  const raw = fs.readFileSync(fullPath, "utf8");
  return JSON.parse(raw) as T;
}

async function main() {
  const openAI = getOpenAIClient();
  const writingAnalysis = loadJSON<WritingAnalysis>("writingAnalysis.json");
  const draft = await firstDraftAgent(openAI, "", writingAnalysis);

  console.log(draft);
}

main();
