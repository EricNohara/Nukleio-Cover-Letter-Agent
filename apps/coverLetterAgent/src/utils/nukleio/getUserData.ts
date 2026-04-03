import "dotenv/config";
import {
  IUserInfo,
  IUserInfoResponse,
} from "../../interfaces/IUserInfoResponse";

// env vars
const NUKLEIO_API_KEY = process.env.NUKLEIO_API_KEY!;
const NUKLEIO_BASE_URL = process.env.NUKLEIO_BASE_URL!;

const isNonEmptyString = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.length > 0;

export default async function getUserData(
  userId: string,
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
    const err = (await res.json()) as { message?: string };
    throw new Error(
      `Failed to fetch nukleio user data: ${res.status} - ${err.message ?? "Unknown error"}`,
    );
  }

  const raw = (await res.json()) as IUserInfoResponse;
  if (!raw?.userInfo) return null;

  const u = raw.userInfo;

  const cleaned: IUserInfo = {
    name: u.name,
    email: u.email,
    ...(u.phone_number && { phone_number: u.phone_number }),
    ...(u.current_address && { current_address: u.current_address }),
    ...(u.current_position && { current_position: u.current_position }),
    ...(u.current_company && { current_company: u.current_company }),

    ...(u.skills?.length && {
      skills: u.skills.map((s) => s.name),
    }),

    ...(u.experiences?.length && {
      experiences: u.experiences.map((e) => ({
        company: e.company,
        job_title: e.job_title,
        job_description: e.job_description,
      })),
    }),

    ...(u.projects?.length && {
      projects: u.projects.map((p) => {
        const tech = Array.from(
          new Set([
            ...(p.languages_used ?? []),
            ...(p.frameworks_used ?? []),
            ...(p.technologies_used ?? []),
          ]),
        );

        return {
          name: p.name,
          ...(tech.length ? { tech } : {}),
          description: p.description,
        };
      }),
    }),

    ...(u.education?.length
      ? {
          education: u.education.map((ed) => {
            const fieldsOfStudy = [
              ...(ed.majors ?? []),
              ...(ed.minors ?? []),
            ].filter(isNonEmptyString);

            const courses = (ed.courses ?? [])
              .map((c) => c.description)
              .filter(isNonEmptyString);

            return {
              degree: ed.degree,
              institution: ed.institution,
              ...(fieldsOfStudy.length
                ? { fields_of_study: fieldsOfStudy }
                : {}),
              ...(courses.length ? { courses } : {}),
            };
          }),
        }
      : {}),
  };

  return cleaned;
}
