import { APIGatewayProxyHandler } from "aws-lambda";
import { z } from "zod";
import { runPipeline } from "./pipeline";

// use zod to validate input JSON
const inputSchema = z.object({
  email: z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: "Invalid email address",
  }),
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
  writingSample: z.string().optional(),
});

// main entrypoint for AWS lambda function
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const input = inputSchema.parse(body);

    const result = await runPipeline(input);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, result }),
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
