import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import {
  runDescriptionPipeline,
  runPipeline,
  runRevisionPipeline,
} from "./pipeline";

import { z } from "zod";

const generateSchema = z.object({
  userId: z.string(),
  jobUrl: z.string().url(),
  jobTitle: z.string(),
  companyName: z.string(),
  writingSample: z.string().optional(),
});

const generateFromDescriptionSchema = z.object({
  userId: z.string(),
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
      const input = generateSchema.parse(body);
      const result = await runPipeline(input);
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(result),
      };
    }

    if (route === "/generateFromDescription") {
      const input = generateFromDescriptionSchema.parse(body);
      const result = await runDescriptionPipeline(input);
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify(result),
      };
    }

    if (route === "/revise") {
      const input = reviseSchema.parse(body);
      const pdfBuffer = await runRevisionPipeline(input);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/pdf",
          "Content-Disposition": 'inline; filename="cover_letter.pdf"',
        },
        isBase64Encoded: true,
        body: pdfBuffer.toString("base64"),
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
