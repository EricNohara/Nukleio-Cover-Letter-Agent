export interface IUserInfoResponse {
  userInfo: IUserInfo;
}

export interface IUserInfo {
  name: string;
  phone_number: string | null;
  email: string;
  current_address: string | null;
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
}

/* ---------------- EXPERIENCE ---------------- */

export interface IUserExperience {
  company: string;
  job_title: string;
  date_start: string;
  date_end: string | null;
  job_description: string;
}

/* ---------------- PROJECTS ---------------- */

export interface IUserProject {
  name: string;
  languages_used: string[] | null;
  frameworks_used: string[] | null;
  technologies_used: string[] | null;
  description: string;
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
  description: string | null;
}
