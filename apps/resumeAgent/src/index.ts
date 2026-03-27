import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { runPipeline, runEnhancementPipeline } from "./pipeline";
import { z } from "zod";

const generateResumeSchema = z.object({
  userId: z.string(),
  templateId: z.string().optional(),
});

const enhanceResumeSchema = z.object({
  userId: z.string(),
  resumeUrl: z.string(),
  feedback: z.string().optional(),
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
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
      const input = generateResumeSchema.parse(body);
      const result = await runPipeline(input);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      };
    }

    if (route === "/enhance") {
      const input = enhanceResumeSchema.parse(body);
      const result = await runEnhancementPipeline(input);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      };
    }

    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ success: false, error: "Route not found" }),
    };
  } catch (err: any) {
    console.error(err);

    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: false,
        error: err?.message ?? "Unknown error",
      }),
    };
  }
};
