import { IUserInfo } from "../interfaces/IUserInfoResponse";
import {
  IResumeDocument,
  IResumeEducation,
  IResumeExperience,
  IResumeProject,
} from "../interfaces/IResumeDocument";

function splitDescriptionIntoBullets(
  text: string,
  maxBullets: number,
): string[] {
  return text
    .split(/\n|•|-/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, maxBullets);
}

function buildProjectSubtitle(
  languages: string[] | null,
  frameworks: string[] | null,
  technologies: string[] | null,
): string | null {
  const values = [
    ...(languages ?? []),
    ...(frameworks ?? []),
    ...(technologies ?? []),
  ]
    .map((item) => item.trim())
    .filter(Boolean);

  if (values.length === 0) {
    return null;
  }

  return values.join(", ");
}

function normalizeExperience(
  experiences: IUserInfo["experiences"],
): IResumeExperience[] {
  return experiences.map((exp) => ({
    company: exp.company,
    title: exp.job_title,
    startDate: exp.date_start,
    endDate: exp.date_end ?? "Present",
    bullets: splitDescriptionIntoBullets(exp.job_description, 4),
  }));
}

function normalizeProjects(projects: IUserInfo["projects"]): IResumeProject[] {
  return projects.map((project) => ({
    name: project.name,
    subtitle: buildProjectSubtitle(
      project.languages_used,
      project.frameworks_used,
      project.technologies_used,
    ),
    bullets: splitDescriptionIntoBullets(project.description, 3),
  }));
}

function normalizeEducation(
  education: IUserInfo["education"],
): IResumeEducation[] {
  return education.map((edu) => {
    const details: string[] = [];

    if (edu.majors.length > 0) {
      details.push(
        `Major${edu.majors.length > 1 ? "s" : ""}: ${edu.majors.join(", ")}`,
      );
    }

    if (edu.minors.length > 0) {
      details.push(
        `Minor${edu.minors.length > 1 ? "s" : ""}: ${edu.minors.join(", ")}`,
      );
    }

    if (edu.gpa) {
      details.push(`GPA: ${edu.gpa}`);
    }

    for (const award of edu.awards) {
      if (award.trim()) {
        details.push(award.trim());
      }
    }

    const describedCourses = edu.courses
      .map((course) => course.description?.trim())
      .filter((course): course is string => Boolean(course));

    if (describedCourses.length > 0) {
      details.push(`Relevant Coursework: ${describedCourses.join(", ")}`);
    }

    return {
      institution: edu.institution,
      degree: edu.degree,
      startYear: edu.year_start,
      endYear: edu.year_end ?? "Present",
      details,
    };
  });
}

export function normalizeResumeDocument(userInfo: IUserInfo): IResumeDocument {
  const headline =
    userInfo.current_position && userInfo.current_company
      ? `${userInfo.current_position} at ${userInfo.current_company}`
      : userInfo.current_position || userInfo.current_company || null;

  return {
    contact: {
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone_number,
      address: userInfo.current_address,
      headline,
    },
    summary: null,
    skills: userInfo.skills.map((skill) => skill.name.trim()).filter(Boolean),
    experience: normalizeExperience(userInfo.experiences),
    projects: normalizeProjects(userInfo.projects),
    education: normalizeEducation(userInfo.education),
  };
}
