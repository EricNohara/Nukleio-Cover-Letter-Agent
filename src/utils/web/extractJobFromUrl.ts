import axios from "axios";
import { URL } from "url";
import "dotenv/config";
import {
  ITheirStackJob,
  ITheirStackResponse,
} from "../../interfaces/ITheirStackResponse";

function cleanJob(raw: any): ITheirStackJob {
  return {
    url: raw.url,
    final_url: raw.final_url,
    source_url: raw.source_url,
    job_title: raw.job_title,
    remote: raw.remote,
    hybrid: raw.hybrid,
    seniority: raw.seniority,
    hiring_team:
      raw.hiring_team?.map((m: any) => ({
        full_name: m.full_name,
        linkedin_url: m.linkedin_url,
        role: m.role,
      })) ?? [],
    employment_statuses: raw.employment_statuses ?? [],
    technology_slugs: raw.technology_slugs ?? [],
    description: raw.description,
    company_object: {
      name: raw.company_object?.name,
      industry: raw.company_object?.industry,
      long_description: raw.company_object?.long_description,
    },
    locations:
      raw.locations?.map((l: any) => ({
        display_name: l.display_name,
      })) ?? [],
  };
}

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
  } catch {
    return null;
  }

  /* ---------------- MATCH BY URL ---------------- */
  const exact = results.find((j) => jobMatches(j, jobUrl));
  if (exact) return cleanJob(exact);

  /* ---------------- MATCH BY JOB TITLE ---------------- */
  const nt = normalize(jobTitle);
  const titleMatch = results.find((j) => normalize(j.job_title).includes(nt));
  if (titleMatch) return cleanJob(titleMatch);

  /* ---------------- MATCH BY COMPANY NAME ---------------- */
  const nc = normalize(companyName);
  const companyMatch = results.find((j) =>
    normalize(j.company_object?.name).includes(nc)
  );
  if (companyMatch) return cleanJob(companyMatch);

  return null;
}
