import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { runPipeline, runRevisionPipeline } from "./pipeline";

import { z } from "zod";

const headshotSizeSchema = z.enum([
  "1024x1024",
  "1536x1024",
  "1024x1536",
  "auto",
]);

const generateProfessionalHeadshotSchema = z.object({
  referenceUrl: z.string(),
  backgroundDescription: z.string().nullable(),
  backgroundUrl: z.string().optional(),
  layout: headshotSizeSchema,
});

const reviseProfessionalHeadshotSchema = z.object({
  headshotUrl: z.string(),
  feedback: z.string(),
  layout: headshotSizeSchema,
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
      const input = generateProfessionalHeadshotSchema.parse(body);
      const result = await runPipeline(input);
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(result),
      };
    }

    if (route === "/revise") {
      const input = reviseProfessionalHeadshotSchema.parse(body);
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
