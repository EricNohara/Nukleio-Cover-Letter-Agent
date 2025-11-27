export interface ITheirStackResponse {
  data: ITheirStackJob[];
}

export interface ITheirStackJob {
  url: string;
  final_url: string | null;
  source_url: string | null;
  job_title: string;
  date_posted: string;
  remote: boolean | null;
  hybrid: boolean | null;
  salary_string: string | null;
  min_annual_salary_usd: number | null;
  max_annual_salary_usd: number | null;
  avg_annual_salary_usd: number | null;
  seniority: string | null;
  hiring_team: IHiringTeamMember[];
  employment_statuses: string[];
  technology_slugs: string[];
  description: string;
  company_object: ITheirStackCompany;
  locations: ITheirStackLocation[];
  normalized_title: string | null;
  manager_roles: string[];
  matching_phrases: any[];
  matching_words: any[];
}

export interface IHiringTeamMember {
  first_name: string | null;
  full_name: string | null;
  linkedin_url: string | null;
  role: string | null;
}

export interface ITheirStackCompany {
  name: string;
  industry: string | null;
  country: string | null;
  employee_count: number | null;
  num_jobs: number | null;
  num_technologies: number | null;
  num_jobs_last_30_days: number | null;
  is_recruiting_agency: boolean | null;
  founded_year: number | null;
  annual_revenue_usd_readable: string | null;
  total_funding_usd: number | null;
  last_funding_round_date: string | null;
  last_funding_round_amount_readable: string | null;
  employee_count_range: string | null;
  long_description: string | null;
  seo_description: string | null;
  city: string | null;
  postal_code: string | null;
  company_keywords: string[];
  investors: string[];
  funding_stage: string | null;
  technology_slugs: string[];
}

export interface ITheirStackLocation {
  continent: string | null;
  country_name: string | null;
  display_name: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string | null;
  state: string | null;
  type: string | null;
}
