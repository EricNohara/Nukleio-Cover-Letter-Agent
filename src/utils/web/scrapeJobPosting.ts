import * as cheerio from "cheerio";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export default async function scrapeJobPosting(
  jobUrl: string
): Promise<string> {
  //   const executablePath =
  // "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const executablePath = await chromium.executablePath();

  const browser = await puppeteer.launch({
    executablePath,
    args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  });

  try {
    await page.goto(jobUrl, { waitUntil: "networkidle2", timeout: 30_000 });

    // allow dynamic rendering (React/Workday/Greenhouse)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const html = await page.content();
    const $ = cheerio.load(html);

    // clean the html elements
    $("script, style, nav, footer, iframe, img, svg, noscript").remove();

    let postingText =
      $("article").text() ||
      $(".job, .description, .posting, .job-description").text() ||
      $("body").text();

    postingText = postingText.replace(/\s+/g, " ").trim();

    if (postingText.length < 100) {
      throw new Error("Scraped content too short.");
    }

    return postingText;
  } finally {
    await browser.close();
  }
}
