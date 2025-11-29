import { z } from "zod";
import { APIGatewayProxyHandler } from "aws-lambda";
import { runPipeline, runRevisionPipeline } from "./pipeline";

// use zod to validate input JSON
const inputSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  jobUrl: z.string().refine(
    (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Invalid URL",
    }
  ),
  jobTitle: z.string(),
  companyName: z.string(),
  writingSample: z.string().optional(),
});

const userRevisionSchema = z.object({
  conversationId: z.string(),
  feedback: z.string(),
});

// main entrypoint for AWS lambda function
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const input = inputSchema.parse(body);

    // invoke the agentic pipeline
    const result = await runPipeline(input);

    // return the outputted plain text conver letter from pipeline
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};

// ========== REVISION HANDLER ==========

export const reviseHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const input = userRevisionSchema.parse(body);

    const revised = await runRevisionPipeline(input);

    return {
      statusCode: 200,
      body: JSON.stringify(revised),
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
