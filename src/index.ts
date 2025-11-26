import { z } from "zod";
import { APIGatewayProxyHandler } from "aws-lambda";
// import { runPipeline } from "./pipeline";
// import scrapeJobPosting from "./utils/web/scrapeJobPosting";
import { extractJobFromUrl } from "./utils/web/extractJobFromUrl";

// use zod to validate input JSON
const inputSchema = z.object({
  // userId: z.string().min(1, "userId is required"),
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
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  writingSample: z.string().optional(),
});

// main entrypoint for AWS lambda function
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const input = inputSchema.parse(body);

    // invoke the agentic pipeline
    // const result = await runPipeline(input);

    // const result = await scrapeJobPosting(input.jobUrl);
    const result = await extractJobFromUrl(
      input.jobUrl,
      input.jobTitle,
      input.companyName
    );

    // return the outputted PDF from pipeline
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, result: result }),
    };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
