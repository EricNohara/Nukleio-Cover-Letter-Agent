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
  skills: Array<string>;
  experiences: Array<{
    company: string;
    job_title: string;
    job_description: string;
  }>;
  projects: Array<{
    name: string;
    tech: string[];
    description: string;
  }>;
  education: Array<{
    degree: string;
    majors: string[];
    minors: string[];
    institution: string;
    courses: Array<{
      name: string;
      description: string | null;
    }>;
  }>;
};

const llmOutputSchema = z.object({
  skills: z.array(z.string()),
  experiences: z.array(
    z.object({
      company: z.string(),
      job_title: z.string(),
      job_description: z.string(),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      courses: z.array(z.string()),
    }),
  ),
});

type LLMOutput = z.infer<typeof llmOutputSchema>;

function toLLMInput(userInfo: IUserInfo): LLMInput {
  return {
    skills: userInfo.skills.map((skill) => skill.name),
    experiences: userInfo.experiences.map((experience) => ({
      company: experience.company,
      job_title: experience.job_title,
      job_description: experience.job_description,
    })),
    projects: userInfo.projects.map((project) => ({
      name: project.name,
      tech: Array.from(
        new Set([
          ...(project.languages_used ?? []),
          ...(project.frameworks_used ?? []),
          ...(project.technologies_used ?? []),
        ]),
      ),
      description: project.description,
    })),
    education: userInfo.education.map((education) => ({
      degree: education.degree,
      majors: education.majors,
      minors: education.minors,
      institution: education.institution,
      courses: education.courses.map((course) => ({
        name: course.name,
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
Optimize the user's data for a resume. Edit ONLY experience and project description fields.
Return JSON only.

IMPORTANT HARD RULES:
1. Be concise.
2. Keep the strongest items in each category.
3. Prioritize items that are:
   - technically strong and relevant to software engineering
   ${hasTargets ? "- aligned to the provided target jobs" : ""}
4. ONLY fields that can be rewritten:
   - experiences[].job_description
   - projects[].description
5. Do NOT change any fields other than those 2.
6. REMOVE weaker or less relevant items.

SELECTION LIMITS:
- skills <= ${resolved.maxSkills}
- experiences <= ${resolved.maxExperiences}
- projects <= ${resolved.maxProjects}
- education entries <= ${resolved.maxEducations}
- courses per education entry <= ${resolved.maxCoursesPerEducation}

DESCRIPTION REWRITE STYLE:
- sentence count <= 3
- sentence length <= 130 characters
- concise, technical, no first person

${hasTargets ? `TARGET JOBS:\n${JSON.stringify(targetJobs)}` : ""}

USER PROFILE DATA:
${JSON.stringify(userInfo)}
`;
}

function reattachSkills(
  original: IUserInfo["skills"],
  selected: LLMOutput["skills"],
): IUserInfo["skills"] {
  return selected.map((skill) => {
    const match = original.find(
      (originalSkill) => originalSkill.name === skill,
    );

    if (!match) {
      throw new Error(`Failed to reattach skill id for "${skill}"`);
    }

    return {
      id: match.id,
      name: match.name,
      proficiency: match.proficiency,
      years_of_experience: match.years_of_experience,
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
        originalExperience.job_title === experience.job_title,
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
      (originalProject) => originalProject.name === project.name,
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
        originalEducation.degree === education.degree,
    );

    if (!educationMatch) {
      throw new Error(
        `Failed to reattach education id for "${education.institution} - ${education.degree}"`,
      );
    }

    const courses = education.courses.map((course) => {
      const courseMatch = educationMatch.courses.find(
        (originalCourse) => originalCourse.name === course,
      );

      if (!courseMatch) {
        throw new Error(
          `Failed to reattach course id for "${educationMatch.institution} - ${course}"`,
        );
      }

      return {
        id: courseMatch.id,
        name: courseMatch.name,
        grade: courseMatch.grade,
        description: courseMatch.description,
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
                type: "string",
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
                  job_description: { type: "string" },
                },
                required: ["company", "job_title", "job_description"],
              },
            },
            projects: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                },
                required: ["name", "description"],
              },
            },
            education: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  degree: { type: "string" },
                  institution: { type: "string" },
                  courses: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                },
                required: ["degree", "institution", "courses"],
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
