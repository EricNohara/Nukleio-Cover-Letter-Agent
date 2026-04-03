export interface IJobInfoLlmResponse {
  role_summary?: string;
  work_mode?: "remote" | "hybrid" | "onsite";
  locations?: string[];
  qualifications?: string[];
  responsibilities?: string[];
  technologies?: string[];
  company?: {
    industry?: string;
    company_summary?: string;
  };
  hiring_team?: {
    name?: string;
  }[];
}

export interface IJobInfo {
  role_summary?: string;
  work_mode?: "remote" | "hybrid" | "onsite";
  locations?: string[];
  qualifications?: string[];
  responsibilities?: string[];
  technologies?: string[];
  job_title: string;
  company: {
    name: string;
    industry?: string;
    company_summary?: string;
  };
  hiring_team?: {
    name?: string;
  }[];
}
