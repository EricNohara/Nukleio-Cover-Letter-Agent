export interface IUserInfoResponse {
  userInfo: IUserInfo;
}

export interface IUserInfo {
  email: string;
  name: string | null;
  bio: string | null;
  current_position: string | null;
  current_company: string | null;
  phone_number: string | null;
  current_address: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portrait_url: string | null;
  resume_url: string | null;
  transcript_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  x_url: string | null;
  skills: IUserSkill[];
  experiences: IUserExperience[];
  projects: IUserProject[];
  education: IUserEducation[];
}

/* ---------------- SKILLS ---------------- */

export interface IUserSkill {
  id: string;
  name: string;
  // use to sort skills by proficiency and experience
  proficiency: number | null;
  years_of_experience: number | null;
}

/* ---------------- EXPERIENCE ---------------- */

export interface IUserExperience {
  id: string;
  company: string;
  job_title: string;
  date_start: string;
  date_end: string | null;
  job_description: string;
}

/* ---------------- PROJECTS ---------------- */

export interface IUserProject {
  id: string;
  name: string;
  date_start: string;
  date_end: string;
  languages_used: string[] | null;
  frameworks_used: string[] | null;
  technologies_used: string[] | null;
  description: string;
  github_url: string | null;
  demo_url: string | null;
}

/* ---------------- EDUCATION ---------------- */

export interface IUserEducation {
  id: string;
  degree: string;
  majors: string[];
  minors: string[];
  gpa: string | null;
  institution: string;
  awards: string[];
  year_start: number;
  year_end: number | null;
  courses: IUserCourse[];
}

export interface IUserCourse {
  id: string;
  name: string;
  // sort courses by grade
  grade: string | null;
  description: string | null;
}
