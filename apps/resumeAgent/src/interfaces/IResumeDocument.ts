export interface IResumeDocument {
  contact: {
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    headline?: string | null;
  };
  summary?: string | null;
  skills: string[];
  experience: IResumeExperience[];
  projects: IResumeProject[];
  education: IResumeEducation[];
}

export interface IResumeExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface IResumeProject {
  name: string;
  subtitle?: string | null;
  bullets: string[];
}

export interface IResumeEducation {
  institution: string;
  degree: string;
  startYear: number;
  endYear: number | "Present";
  details: string[];
}
