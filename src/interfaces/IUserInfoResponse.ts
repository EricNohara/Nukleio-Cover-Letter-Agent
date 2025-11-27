export interface IUserInfoResponse {
  userInfo: IUserInfo;
}

export interface IUserInfo {
  name: string;
  phone_number: string | null;
  email: string;
  current_address: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
  transcript_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  x_url: string | null;
  bio: string | null;
  current_position: string | null;
  current_company: string | null;
  skills: IUserSkill[];
  experiences: IUserExperience[];
  projects: IUserProject[];
  education: IUserEducation[];
}

/* ---------------- SKILLS ---------------- */

export interface IUserSkill {
  name: string;
  proficiency: number;
  years_of_experience: number;
  user_id: string;
}

/* ---------------- EXPERIENCE ---------------- */

export interface IUserExperience {
  company: string;
  job_title: string;
  date_start: string;
  date_end: string | null;
  job_description: string;
  user_id: string;
}

/* ---------------- PROJECTS ---------------- */

export interface IUserProject {
  name: string;
  date_start: string;
  date_end: string | null;
  languages_used: string[] | null;
  frameworks_used: string[] | null;
  technologies_used: string[] | null;
  description: string;
  github_url: string | null;
  demo_url: string | null;
  thumbnail_url: string | null;
  user_id: string;
}

/* ---------------- EDUCATION ---------------- */

export interface IUserEducation {
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
  name: string;
  grade: string | null;
  education_id: number;
  user_id: string;
  description: string | null;
}
