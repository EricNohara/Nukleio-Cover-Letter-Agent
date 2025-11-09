import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function runPipeline({
  email,
  jobUrl,
  writingSample,
}: {
  email: string;
  jobUrl: string;
  writingSample?: string | undefined;
}) {
  // Example: get user data from your Next.js app
  const userData = await fetch(
    `${process.env.NEXT_API_URL}/api/user?email=${email}`,
    {
      headers: { Authorization: `Bearer ${process.env.INTERNAL_API_KEY}` },
    }
  ).then((res) => res.json());

  // Simple example agent call
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a cover letter generator." },
      {
        role: "user",
        content: `User data: ${JSON.stringify(
          userData
        )}\nJob link: ${jobUrl}\nWriting sample: ${writingSample}`,
      },
    ],
  });

  return completion.choices[0]?.message?.content;
}
