import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { runPipeline, runRevisionPipeline } from "./pipeline";

import { z } from "zod";

const generateCoverLetterSchema = z.object({
  userId: z.string(),
  jobTitle: z.string(),
  companyName: z.string(),
  jobDescriptionDump: z.string(),
  writingSample: z.string().optional(),
});

const reviseSchema = z.object({
  conversationId: z.string(),
  feedback: z.string(),
  finalLetter: z.string().optional(),
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // Handle preflight CORS
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
    };
  }

  try {
    const route = event.rawPath;

    const body = JSON.parse(event.body || "{}");

    if (route === "/generate") {
      const input = generateCoverLetterSchema.parse(body);
      const result = await runPipeline(input);
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(result),
      };
    }

    if (route === "/revise") {
      const input = reviseSchema.parse(body);
      const result = await runRevisionPipeline(input);
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(result),
      };
    }

    return {
      statusCode: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, error: "Route not found" }),
    };
  } catch (err: any) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
