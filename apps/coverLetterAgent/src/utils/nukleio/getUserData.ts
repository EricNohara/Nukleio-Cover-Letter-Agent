import "dotenv/config";
import {
  IUserInfo,
  IUserInfoResponse,
  IUserSkill,
  IUserExperience,
  IUserProject,
  IUserEducation,
  IUserCourse,
} from "../../interfaces/IUserInfoResponse";

// env vars
const NUKLEIO_API_KEY = process.env.NUKLEIO_API_KEY!;
const NUKLEIO_BASE_URL = process.env.NUKLEIO_BASE_URL!;

export default async function getUserData(
  userId: string
): Promise<IUserInfo | null> {
  const res = await fetch(NUKLEIO_BASE_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${NUKLEIO_API_KEY}`,
      "X-Target-User-Id": userId,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err: any = await res.json();
    throw new Error(
      `Failed to fetch nukleio user data: ${res.status} - ${err.message}`
    );
  }

  const raw = (await res.json()) as IUserInfoResponse;

  if (!raw || !raw.userInfo) return null;

  const u = raw.userInfo;

  // CLEAN USER INFO (strip extra fields)
  const cleaned: IUserInfo = {
    name: u.name,
    phone_number: u.phone_number ?? null,
    email: u.email,
    current_address: u.current_address ?? null,
    current_position: u.current_position ?? null,
    current_company: u.current_company ?? null,

    // SKILLS
    skills: (u.skills ?? []).map(
      (s): IUserSkill => ({
        name: s.name,
      })
    ),

    // EXPERIENCE
    experiences: (u.experiences ?? []).map(
      (e): IUserExperience => ({
        company: e.company,
        job_title: e.job_title,
        date_start: e.date_start,
        date_end: e.date_end ?? null,
        job_description: e.job_description,
      })
    ),

    // PROJECTS
    projects: (u.projects ?? []).map(
      (p): IUserProject => ({
        name: p.name,
        languages_used: p.languages_used ?? null,
        frameworks_used: p.frameworks_used ?? null,
        technologies_used: p.technologies_used ?? null,
        description: p.description,
      })
    ),

    // EDUCATION
    education: (u.education ?? []).map(
      (ed): IUserEducation => ({
        degree: ed.degree,
        majors: ed.majors ?? [],
        minors: ed.minors ?? [],
        gpa: ed.gpa ?? null,
        institution: ed.institution,
        awards: ed.awards ?? [],
        year_start: ed.year_start,
        year_end: ed.year_end ?? null,
        courses: (ed.courses ?? []).map(
          (c): IUserCourse => ({
            description: c.description ?? null,
          })
        ),
      })
    ),
  };

  return cleaned;
}
