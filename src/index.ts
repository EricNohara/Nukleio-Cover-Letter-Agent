import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { runPipeline, runRevisionPipeline } from "./pipeline";

import { z } from "zod";

const generateSchema = z.object({
  userId: z.string(),
  jobUrl: z.string().url(),
  jobTitle: z.string(),
  companyName: z.string(),
  writingSample: z.string().optional(),
});

const reviseSchema = z.object({
  conversationId: z.string(),
  feedback: z.string(),
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const route = event.rawPath;

    const body = JSON.parse(event.body || "{}");

    if (route === "/generate") {
      const input = generateSchema.parse(body);
      const result = await runPipeline(input);
      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    }

    if (route === "/revise") {
      const input = reviseSchema.parse(body);
      const result = await runRevisionPipeline(input);
      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ success: false, error: "Route not found" }),
    };
  } catch (err: any) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
