import axios from "axios";
import { URL } from "url";
import "dotenv/config";
import {
  ITheirStackJob,
  ITheirStackResponse,
} from "../../interfaces/ITheirStackResponse";

const THEIRSTACK_API = "https://api.theirstack.com/v1/jobs/search";

/* ---------------- UTILITIES ---------------- */

function normalize(str?: string | null) {
  return str?.toLowerCase().trim() || "";
}

function getDomain(rawUrl: string): string {
  const u = new URL(rawUrl);
  return u.hostname.replace("www.", "").toLowerCase();
}

function jobMatches(job: ITheirStackJob, targetUrl: string): boolean {
  const lower = targetUrl.toLowerCase();
  return (
    job.url?.toLowerCase() === lower ||
    job.final_url?.toLowerCase() === lower ||
    job.source_url?.toLowerCase() === lower ||
    lower.includes(job.url?.toLowerCase() || "") ||
    lower.includes(job.final_url?.toLowerCase() || "") ||
    lower.includes(job.source_url?.toLowerCase() || "")
  );
}

/* ---------------- MAIN FUNCTION ---------------- */

export async function extractJobFromUrl(
  jobUrl: string,
  jobTitle: string,
  companyName: string
): Promise<ITheirStackJob | null> {
  const apiKey = process.env.THEIRSTACK_API_KEY;
  if (!apiKey) throw new Error("Missing THEIRSTACK_API_KEY");

  const domain = getDomain(jobUrl);

  const filters: any = {
    limit: 1,
    posted_at_max_age_days: 120,
    job_title_or: [jobTitle],
    company_name_case_insensitive_or: [companyName],
    company_name_partial_match_or: [companyName],
    url_domain_or: domain.includes("linkedin")
      ? ["linkedin.com", "www.linkedin.com"]
      : [domain],
  };

  let results: ITheirStackJob[] = [];

  try {
    const res = await axios.post<ITheirStackResponse>(THEIRSTACK_API, filters, {
      headers: { Authorization: `Bearer ${apiKey}` },
      validateStatus: () => true,
    });

    if (res.status !== 200) return null;

    results = res.data?.data ?? [];
  } catch (err: any) {
    return null;
  }

  /* ---------------- MATCH BY URL ---------------- */

  const exact = results.find((j) => jobMatches(j, jobUrl));
  if (exact) return exact;

  /* ---------------- MATCH BY JOB TITLE ---------------- */

  const nt = normalize(jobTitle);
  const titleMatch = results.find((j) => normalize(j.job_title).includes(nt));
  if (titleMatch) return titleMatch;

  /* ---------------- MATCH BY COMPANY NAME ---------------- */

  const nc = normalize(companyName);
  const companyMatch = results.find((j) =>
    normalize(j.company_object?.name).includes(nc)
  );
  if (companyMatch) return companyMatch;

  /* ---------------- NO MATCH ---------------- */

  return null;
}
