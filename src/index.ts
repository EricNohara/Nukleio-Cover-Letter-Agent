import { APIGatewayProxyHandler } from "aws-lambda";
import { z } from "zod";
import { runPipeline } from "./pipeline";

// get nukleio env variables
const NUKLEIO_API_KEY = process.env.NUKLEIO_API_KEY!;
const NUKLEIO_BASE_URL = process.env.NUKLEIO_BASE_URL!;

// use zod to validate input JSON
const inputSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  // jobUrl: z.string().refine(
  //   (val) => {
  //     try {
  //       new URL(val);
  //       return true;
  //     } catch {
  //       return false;
  //     }
  //   },
  //   {
  //     message: "Invalid URL",
  //   }
  // ),
  // writingSample: z.string().optional(),
});

// main entrypoint for AWS lambda function
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const input = inputSchema.parse(body);

    // get the user id
    const userId = input.userId;

    console.log(userId);
    console.log(NUKLEIO_API_KEY);
    console.log(NUKLEIO_BASE_URL);

    // fetch the user from nukleio
    const res = await fetch(NUKLEIO_BASE_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${NUKLEIO_API_KEY}`,
        "X-Target-User-Id": userId,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        `Failed to fetch nukleio user data: ${res.status} - ${errText}`
      );
    }

    const data = await res.json();

    // return the data for now
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        userData: data,
      }),
    };

    // const result = await runPipeline(input);

    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({ success: true, result }),
    // };
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
