export interface IUserInfoResponse {
  userInfo: IUserInfoRaw;
}

export interface IUserInfoRaw {
  name: string;
  phone_number: string | null;
  email: string;
  current_address: string | null;
  current_position: string | null;
  current_company: string | null;
  skills: IUserSkillRaw[];
  experiences: IUserExperience[];
  projects: IUserProjectRaw[];
  education: IUserEducationRaw[];
}

/* ---------------- SKILLS ---------------- */

export interface IUserSkillRaw {
  name: string;
}

/* ---------------- EXPERIENCE ---------------- */

export interface IUserExperience {
  company: string;
  job_title: string;
  job_description: string;
}

/* ---------------- PROJECTS ---------------- */

export interface IUserProjectRaw {
  name: string;
  languages_used: string[] | null;
  frameworks_used: string[] | null;
  technologies_used: string[] | null;
  description: string;
}

/* ---------------- EDUCATION ---------------- */

export interface IUserEducationRaw {
  degree: string;
  majors: string[];
  minors: string[];
  gpa: string | null;
  institution: string;
  awards: string[];
  courses: IUserCourseRaw[];
}

export interface IUserCourseRaw {
  description: string | null;
}

// CLEANED VERSIONS

export interface IUserInfo {
  name: string;
  phone_number?: string;
  email: string;
  current_address?: string;
  current_position?: string;
  current_company?: string;
  skills?: string[];
  experiences?: IUserExperience[];
  projects?: IUserProject[];
  education?: IUserEducation[];
}

export interface IUserProject {
  name: string;
  tech?: string[];
  description: string;
}

export interface IUserEducation {
  degree: string;
  fields_of_study?: string[];
  institution: string;
  awards?: string[];
  courses?: string[];
}
