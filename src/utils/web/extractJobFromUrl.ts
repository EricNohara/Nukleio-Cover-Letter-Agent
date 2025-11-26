import axios from "axios";
import { URL } from "url";
import "dotenv/config";

const THEIRSTACK_API = "https://api.theirstack.com/v1/jobs/search";

export interface ExtractedJob {
  job: any;
  company: any;
  matchType: string;
}

/* ---------------- UTILITIES ---------------- */

function normalize(str?: string | null) {
  return str?.toLowerCase().trim() || "";
}

function getDomain(rawUrl: string): string {
  const u = new URL(rawUrl);
  return u.hostname.replace("www.", "").toLowerCase();
}

function jobMatches(job: any, targetUrl: string): boolean {
  const lower = targetUrl.toLowerCase();
  return (
    job?.url?.toLowerCase() === lower ||
    job?.final_url?.toLowerCase() === lower ||
    job?.source_url?.toLowerCase() === lower ||
    lower.includes(job?.url?.toLowerCase() || "") ||
    lower.includes(job?.final_url?.toLowerCase() || "") ||
    lower.includes(job?.source_url?.toLowerCase() || "")
  );
}

/* ---------------- MAIN FUNCTION ---------------- */

export async function extractJobFromUrl(
  jobUrl: string,
  jobTitle?: string,
  companyName?: string
): Promise<ExtractedJob | null> {
  const apiKey = process.env.THEIRSTACK_API_KEY;
  if (!apiKey) throw new Error("Missing THEIRSTACK_API_KEY");

  const domain = getDomain(jobUrl);

  const filters: any = {
    limit: 1,
    posted_at_max_age_days: 120,
  };

  console.log("🔎 Extracting:", jobUrl);
  console.log("🌐 Domain:", domain);

  /* ----------- ADD SEARCH FILTERS ----------- */

  // If job title provided → use it
  if (jobTitle) {
    filters.job_title_or = [jobTitle];
    console.log("📌 Using job title filter:", jobTitle);
  }

  // If company provided → use exact match first
  if (companyName) {
    filters.company_name_case_insensitive_or = [companyName];
    console.log("🏢 Using exact company name filter:", companyName);

    // ALSO add a fallback partial match
    filters.company_name_partial_match_or = [companyName];
    console.log("🔍 Added partial company name filter:", companyName);
  }

  // Domain handling
  if (domain.includes("linkedin")) {
    filters.url_domain_or = ["linkedin.com", "www.linkedin.com"];
  } else {
    filters.url_domain_or = [domain];
  }

  console.log("🌐 Using domain filters:", filters.url_domain_or);

  /* ---------------- HIT THEIRSTACK ---------------- */

  let results: any[] = [];

  try {
    console.log("📡 Making TheirStack request with filters:");
    console.log(JSON.stringify(filters, null, 2));

    const res = await axios.post(THEIRSTACK_API, filters, {
      headers: { Authorization: `Bearer ${apiKey}` },
      validateStatus: () => true, // <-- allow non-200 through
    });

    if (res.status !== 200) {
      console.error("\n❌ TheirStack API Error");
      console.error("HTTP Status:", res.status);
      console.error("Status Text:", res.statusText);
      console.error("Headers:", res.headers);
      console.error("Response Data:", JSON.stringify(res.data, null, 2), "\n");
      return null;
    }

    results = res.data?.data || [];
  } catch (err: any) {
    console.error("\n❌ Axios Transport Error");

    if (err.response) {
      console.error("HTTP Status:", err.response.status);
      console.error("Headers:", err.response.headers);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    } else if (err.request) {
      console.error("🔌 No response received from API");
      console.error(err.request);
    } else {
      console.error("Message:", err.message);
    }

    return null;
  }

  /* ---------------- MATCH BY URL ---------------- */

  if (results.length > 0) {
    const exact = results.find((j: any) => jobMatches(j, jobUrl));
    if (exact) {
      console.log("✅ Exact match found by URL");
      return { job: exact, company: exact.company_object, matchType: "url" };
    }
  }

  /* ---------------- MATCH BY JOB TITLE ---------------- */

  if (jobTitle) {
    const nt = normalize(jobTitle);
    const match = results.find((j: any) => normalize(j.job_title).includes(nt));
    if (match) {
      console.log("✅ Matched by job title");
      return { job: match, company: match.company_object, matchType: "title" };
    }
  }

  /* ---------------- MATCH BY COMPANY NAME ---------------- */

  if (companyName) {
    const nc = normalize(companyName);
    const match = results.find((j: any) =>
      normalize(j.company_object?.name).includes(nc)
    );
    if (match) {
      console.log("✅ Matched by company name");
      return {
        job: match,
        company: match.company_object,
        matchType: "company",
      };
    }
  }

  /* ---------------- NO MATCH ---------------- */

  console.log("❌ No match found.");
  return null;
}
