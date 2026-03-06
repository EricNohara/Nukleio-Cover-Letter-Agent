export interface ITheirStackResponse {
  data: ITheirStackJob[];
}

export interface ITheirStackJob {
  url: string;
  final_url: string | null;
  source_url: string | null;
  job_title: string;
  remote: boolean | null;
  hybrid: boolean | null;
  seniority: string | null;
  hiring_team: IHiringTeamMember[];
  employment_statuses: string[];
  technology_slugs: string[];
  description: string;
  company_object: ITheirStackCompany;
  locations: ITheirStackLocation[];
}

export interface IHiringTeamMember {
  full_name: string | null;
  linkedin_url: string | null;
  role: string | null;
}

export interface ITheirStackCompany {
  name: string;
  industry: string | null;
  long_description: string | null;
}

export interface ITheirStackLocation {
  display_name: string | null;
}
