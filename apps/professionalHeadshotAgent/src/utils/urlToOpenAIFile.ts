import axios from "axios";
import { toFile } from "openai";

export async function urlToOpenAIFile(url: string, filename: string) {
  const response = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
  });

  const contentType = response.headers["content-type"] ?? "image/png";
  const buffer = Buffer.from(response.data);

  return toFile(buffer, filename, { type: contentType });
}
