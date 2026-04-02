import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { runGeneratePipeline, runGenerateWithAiPipeline } from "./pipeline";
import { z } from "zod";

const generateResumeSchema = z.object({
  userId: z.string(),
  templateId: z.string().optional(),
  // to include in the resume - if not provided, include all
  educationIds: z.array(z.string()).optional(),
  experienceIds: z.array(z.string()).optional(),
  courseIds: z.array(z.string()).optional(),
  projectIds: z.array(z.string()).optional(),
  skillIds: z.array(z.string()).optional(),
});

// enhance the user info intelligently and output a template
const generateResumeWithAiSchema = z.object({
  userId: z.string(),
  templateId: z.string().optional(),
  // list of job types the user is trying to land
  targetJobs: z.array(z.string()).optional(),
  // LLM determines intelligently which items to include/exclude
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
      const result = await runGeneratePipeline(input);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
      };
    }

    if (route === "/generateAi") {
      const input = generateResumeWithAiSchema.parse(body);
      const result = await runGenerateWithAiPipeline(input);

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
