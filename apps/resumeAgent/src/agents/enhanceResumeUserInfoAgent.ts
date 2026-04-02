import OpenAI from "openai";
import { z } from "zod";
import { IUserInfo } from "../interfaces/IUserInfoResponse";

type ResumeSelectionLimits = {
  maxSkills?: number;
  maxExperiences?: number;
  maxProjects?: number;
  maxEducations?: number;
  maxCoursesPerEducation?: number;
};

const DEFAULT_LIMITS: Required<ResumeSelectionLimits> = {
  maxSkills: 20,
  maxExperiences: 3,
  maxProjects: 3,
  maxEducations: 2,
  maxCoursesPerEducation: 16,
};

type LLMInput = {
  skills: Array<{
    name: string;
    proficiency: number | null;
    years_of_experience: number | null;
  }>;
  experiences: Array<{
    company: string;
    job_title: string;
    date_start: string;
    date_end: string | null;
    job_description: string;
  }>;
  projects: Array<{
    name: string;
    date_start: string;
    date_end: string;
    languages_used: string[] | null;
    frameworks_used: string[] | null;
    technologies_used: string[] | null;
    description: string;
    github_url: string | null;
    demo_url: string | null;
  }>;
  education: Array<{
    degree: string;
    majors: string[];
    minors: string[];
    gpa: string | null;
    institution: string;
    awards: string[];
    year_start: number;
    year_end: number | null;
    courses: Array<{
      name: string;
      grade: string | null;
      description: string | null;
    }>;
  }>;
};

const llmOutputSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string(),
      proficiency: z.number().nullable(),
      years_of_experience: z.number().nullable(),
    }),
  ),
  experiences: z.array(
    z.object({
      company: z.string(),
      job_title: z.string(),
      date_start: z.string(),
      date_end: z.string().nullable(),
      job_description: z.string(),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      date_start: z.string(),
      date_end: z.string(),
      languages_used: z.array(z.string()).nullable(),
      frameworks_used: z.array(z.string()).nullable(),
      technologies_used: z.array(z.string()).nullable(),
      description: z.string(),
      github_url: z.string().nullable(),
      demo_url: z.string().nullable(),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      majors: z.array(z.string()),
      minors: z.array(z.string()),
      gpa: z.string().nullable(),
      institution: z.string(),
      awards: z.array(z.string()),
      year_start: z.number(),
      year_end: z.number().nullable(),
      courses: z.array(
        z.object({
          name: z.string(),
          grade: z.string().nullable(),
          description: z.string().nullable(),
        }),
      ),
    }),
  ),
});

type LLMOutput = z.infer<typeof llmOutputSchema>;

function toLLMInput(userInfo: IUserInfo): LLMInput {
  return {
    skills: userInfo.skills.map((skill) => ({
      name: skill.name,
      proficiency: skill.proficiency,
      years_of_experience: skill.years_of_experience,
    })),
    experiences: userInfo.experiences.map((experience) => ({
      company: experience.company,
      job_title: experience.job_title,
      date_start: experience.date_start,
      date_end: experience.date_end,
      job_description: experience.job_description,
    })),
    projects: userInfo.projects.map((project) => ({
      name: project.name,
      date_start: project.date_start,
      date_end: project.date_end,
      languages_used: project.languages_used,
      frameworks_used: project.frameworks_used,
      technologies_used: project.technologies_used,
      description: project.description,
      github_url: project.github_url,
      demo_url: project.demo_url,
    })),
    education: userInfo.education.map((education) => ({
      degree: education.degree,
      majors: education.majors,
      minors: education.minors,
      gpa: education.gpa,
      institution: education.institution,
      awards: education.awards,
      year_start: education.year_start,
      year_end: education.year_end,
      courses: education.courses.map((course) => ({
        name: course.name,
        grade: course.grade,
        description: course.description,
      })),
    })),
  };
}

function buildPrompt(
  userInfo: LLMInput,
  targetJobs?: string[],
  limits: ResumeSelectionLimits = DEFAULT_LIMITS,
): string {
  const resolved = {
    maxSkills: limits.maxSkills ?? DEFAULT_LIMITS.maxSkills,
    maxExperiences: limits.maxExperiences ?? DEFAULT_LIMITS.maxExperiences,
    maxProjects: limits.maxProjects ?? DEFAULT_LIMITS.maxProjects,
    maxEducations: limits.maxEducations ?? DEFAULT_LIMITS.maxEducations,
    maxCoursesPerEducation:
      limits.maxCoursesPerEducation ?? DEFAULT_LIMITS.maxCoursesPerEducation,
  };

  const hasTargets = Array.isArray(targetJobs) && targetJobs.length > 0;

  return `
Select the strongest resume content from the user's FULL profile and lightly improve ONLY description fields for resume quality.
Return JSON only.

IMPORTANT HARD RULES:
1. This is for a resume, so concise is better.
2. Keep only the strongest items in each category.
3. Prioritize items that are:
   - technically strong and impressive
   - relevant to software engineering / technical roles
   ${hasTargets && "- aligned to the provided target jobs"}
4. ONLY description fields may be rewritten:
   - experiences[].job_description
   - projects[].description
   - education[].courses[].description
5. Do NOT rewrite non-description fields.
6. Do NOT invent facts, metrics, technologies, awards, dates, roles, or accomplishments.
7. Do NOT add new items or fields.
8. Remove weaker or less relevant items entirely instead of keeping everything.
9. Preserve factual meaning exactly.

SELECTION LIMITS - KEEP AT MOST:
- skills: ${resolved.maxSkills}
- experiences: ${resolved.maxExperiences}
- projects: ${resolved.maxProjects}
- education entries: ${resolved.maxEducations}
- courses per education entry: ${resolved.maxCoursesPerEducation}

DESCRIPTION REWRITE STYLE:
- concise
- technical
- resume-oriented
- action-oriented
- no first person

${hasTargets && `TARGET JOBS:\n${JSON.stringify(targetJobs, null, 2)}`}

USER PROFILE DATA:
${JSON.stringify(userInfo, null, 2)}
`;
}

function reattachSkills(
  original: IUserInfo["skills"],
  selected: LLMOutput["skills"],
): IUserInfo["skills"] {
  return selected.map((skill) => {
    const match = original.find(
      (originalSkill) =>
        originalSkill.name === skill.name &&
        originalSkill.proficiency === skill.proficiency &&
        originalSkill.years_of_experience === skill.years_of_experience,
    );

    if (!match) {
      throw new Error(`Failed to reattach skill id for "${skill.name}"`);
    }

    return {
      id: match.id,
      name: skill.name,
      proficiency: skill.proficiency,
      years_of_experience: skill.years_of_experience,
    };
  });
}

function reattachExperiences(
  original: IUserInfo["experiences"],
  selected: LLMOutput["experiences"],
): IUserInfo["experiences"] {
  return selected.map((experience) => {
    const match = original.find(
      (originalExperience) =>
        originalExperience.company === experience.company &&
        originalExperience.job_title === experience.job_title &&
        originalExperience.date_start === experience.date_start &&
        originalExperience.date_end === experience.date_end,
    );

    if (!match) {
      throw new Error(
        `Failed to reattach experience id for "${experience.company} - ${experience.job_title}"`,
      );
    }

    return {
      id: match.id,
      company: match.company,
      job_title: match.job_title,
      date_start: match.date_start,
      date_end: match.date_end,
      job_description: experience.job_description,
    };
  });
}

function reattachProjects(
  original: IUserInfo["projects"],
  selected: LLMOutput["projects"],
): IUserInfo["projects"] {
  return selected.map((project) => {
    const match = original.find(
      (originalProject) =>
        originalProject.name === project.name &&
        originalProject.date_start === project.date_start &&
        originalProject.date_end === project.date_end,
    );

    if (!match) {
      throw new Error(`Failed to reattach project id for "${project.name}"`);
    }

    return {
      id: match.id,
      name: match.name,
      date_start: match.date_start,
      date_end: match.date_end,
      languages_used: match.languages_used,
      frameworks_used: match.frameworks_used,
      technologies_used: match.technologies_used,
      description: project.description,
      github_url: match.github_url,
      demo_url: match.demo_url,
    };
  });
}

function reattachEducation(
  original: IUserInfo["education"],
  selected: LLMOutput["education"],
): IUserInfo["education"] {
  return selected.map((education) => {
    const educationMatch = original.find(
      (originalEducation) =>
        originalEducation.institution === education.institution &&
        originalEducation.degree === education.degree &&
        originalEducation.year_start === education.year_start &&
        originalEducation.year_end === education.year_end,
    );

    if (!educationMatch) {
      throw new Error(
        `Failed to reattach education id for "${education.institution} - ${education.degree}"`,
      );
    }

    const courses = education.courses.map((course) => {
      const courseMatch = educationMatch.courses.find(
        (originalCourse) =>
          originalCourse.name === course.name &&
          originalCourse.grade === course.grade,
      );

      if (!courseMatch) {
        throw new Error(
          `Failed to reattach course id for "${educationMatch.institution} - ${course.name}"`,
        );
      }

      return {
        id: courseMatch.id,
        name: courseMatch.name,
        grade: courseMatch.grade,
        description: course.description,
      };
    });

    return {
      id: educationMatch.id,
      degree: educationMatch.degree,
      majors: educationMatch.majors,
      minors: educationMatch.minors,
      gpa: educationMatch.gpa,
      institution: educationMatch.institution,
      awards: educationMatch.awards,
      year_start: educationMatch.year_start,
      year_end: educationMatch.year_end,
      courses,
    };
  });
}

function mergeEnhancedContent(
  original: IUserInfo,
  enhanced: LLMOutput,
): IUserInfo {
  return {
    email: original.email,
    name: original.name,
    bio: original.bio,
    current_position: original.current_position,
    current_company: original.current_company,
    phone_number: original.phone_number,
    current_address: original.current_address,
    github_url: original.github_url,
    linkedin_url: original.linkedin_url,
    portrait_url: original.portrait_url,
    resume_url: original.resume_url,
    transcript_url: original.transcript_url,
    facebook_url: original.facebook_url,
    instagram_url: original.instagram_url,
    x_url: original.x_url,

    skills: reattachSkills(original.skills, enhanced.skills),
    experiences: reattachExperiences(
      original.experiences,
      enhanced.experiences,
    ),
    projects: reattachProjects(original.projects, enhanced.projects),
    education: reattachEducation(original.education, enhanced.education),
  };
}

export async function enhanceResumeUserInfoAgent(
  openAIClient: OpenAI,
  userInfo: IUserInfo,
  targetJobs?: string[],
  limits: ResumeSelectionLimits = DEFAULT_LIMITS,
): Promise<IUserInfo> {
  const llmInput = toLLMInput(userInfo);
  const prompt = buildPrompt(llmInput, targetJobs, limits);

  const response = await openAIClient.responses.create({
    model: "gpt-5.1",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: "You are a resume optimization assistant. Return valid JSON only.",
          },
        ],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: prompt }],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "enhanced_resume_content",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            skills: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  proficiency: { type: ["number", "null"] },
                  years_of_experience: { type: ["number", "null"] },
                },
                required: ["name", "proficiency", "years_of_experience"],
              },
            },
            experiences: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  company: { type: "string" },
                  job_title: { type: "string" },
                  date_start: { type: "string" },
                  date_end: { type: ["string", "null"] },
                  job_description: { type: "string" },
                },
                required: [
                  "company",
                  "job_title",
                  "date_start",
                  "date_end",
                  "job_description",
                ],
              },
            },
            projects: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  date_start: { type: "string" },
                  date_end: { type: "string" },
                  languages_used: {
                    type: ["array", "null"],
                    items: { type: "string" },
                  },
                  frameworks_used: {
                    type: ["array", "null"],
                    items: { type: "string" },
                  },
                  technologies_used: {
                    type: ["array", "null"],
                    items: { type: "string" },
                  },
                  description: { type: "string" },
                  github_url: { type: ["string", "null"] },
                  demo_url: { type: ["string", "null"] },
                },
                required: [
                  "name",
                  "date_start",
                  "date_end",
                  "languages_used",
                  "frameworks_used",
                  "technologies_used",
                  "description",
                  "github_url",
                  "demo_url",
                ],
              },
            },
            education: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  degree: { type: "string" },
                  majors: {
                    type: "array",
                    items: { type: "string" },
                  },
                  minors: {
                    type: "array",
                    items: { type: "string" },
                  },
                  gpa: { type: ["string", "null"] },
                  institution: { type: "string" },
                  awards: {
                    type: "array",
                    items: { type: "string" },
                  },
                  year_start: { type: "number" },
                  year_end: { type: ["number", "null"] },
                  courses: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        name: { type: "string" },
                        grade: { type: ["string", "null"] },
                        description: { type: ["string", "null"] },
                      },
                      required: ["name", "grade", "description"],
                    },
                  },
                },
                required: [
                  "degree",
                  "majors",
                  "minors",
                  "gpa",
                  "institution",
                  "awards",
                  "year_start",
                  "year_end",
                  "courses",
                ],
              },
            },
          },
          required: ["skills", "experiences", "projects", "education"],
        },
      },
    },
  });

  const parsed = llmOutputSchema.parse(JSON.parse(response.output_text));

  return mergeEnhancedContent(userInfo, parsed);
}
