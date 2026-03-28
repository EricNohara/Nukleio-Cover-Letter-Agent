import { IUserInfo } from "../interfaces/IUserInfoResponse";

function cleanString(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function cleanRequiredString(value: string): string {
  return value.trim();
}

function cleanStringArray(
  values: string[] | null | undefined,
): string[] | null {
  if (!values) return null;

  const cleaned = values.map((value) => value.trim()).filter(Boolean);

  return cleaned.length > 0 ? cleaned : null;
}

function parseDateValue(value: string | null | undefined): number {
  const cleaned = cleanString(value);
  if (!cleaned) return Number.NEGATIVE_INFINITY;

  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  let date: Date;

  if (isoMatch) {
    const [, yearStr, monthStr, dayStr] = isoMatch;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    date = new Date(year, month - 1, day);
  } else {
    date = new Date(cleaned);
  }

  const time = date.getTime();
  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

function formatReadableDate(value: string | null | undefined): string | null {
  const cleaned = cleanString(value);
  if (!cleaned) return null;

  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  let date: Date;

  if (isoMatch) {
    const [, yearStr, monthStr, dayStr] = isoMatch;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    date = new Date(year, month - 1, day);
  } else {
    date = new Date(cleaned);
  }

  if (Number.isNaN(date.getTime())) {
    return cleaned;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatRequiredReadableDate(value: string): string {
  const cleaned = cleanRequiredString(value);
  return formatReadableDate(cleaned) ?? cleaned;
}

function compareNullableNumbersDesc(
  a: number | null | undefined,
  b: number | null | undefined,
): number {
  const aValue = a ?? Number.NEGATIVE_INFINITY;
  const bValue = b ?? Number.NEGATIVE_INFINITY;
  return bValue - aValue;
}

function compareDatesMostRecent(
  aEnd: string | null | undefined,
  aStart: string | null | undefined,
  bEnd: string | null | undefined,
  bStart: string | null | undefined,
): number {
  const aPrimary =
    parseDateValue(aEnd) !== Number.NEGATIVE_INFINITY
      ? parseDateValue(aEnd)
      : parseDateValue(aStart);
  const bPrimary =
    parseDateValue(bEnd) !== Number.NEGATIVE_INFINITY
      ? parseDateValue(bEnd)
      : parseDateValue(bStart);

  if (bPrimary !== aPrimary) {
    return bPrimary - aPrimary;
  }

  const aSecondary = parseDateValue(aStart);
  const bSecondary = parseDateValue(bStart);

  return bSecondary - aSecondary;
}

function educationRecencyValue(education: {
  year_end: number | null | undefined;
  year_start: number | null | undefined;
}): number {
  if (education.year_end != null) return education.year_end;
  if (education.year_start != null) return education.year_start;
  return Number.NEGATIVE_INFINITY;
}

function gradeRank(grade: string | null | undefined): number {
  const cleaned = cleanString(grade)?.toUpperCase();
  if (!cleaned) return -1;

  const ranks: Record<string, number> = {
    "A+": 12,
    A: 11,
    "A-": 10,
    "B+": 9,
    B: 8,
    "B-": 7,
    "C+": 6,
    C: 5,
    "C-": 4,
    "D+": 3,
    D: 2,
    "D-": 1,
    F: 0,
  };

  return ranks[cleaned] ?? -1;
}

export function cleanUserInfo(userInfo: IUserInfo): IUserInfo {
  return {
    email: cleanRequiredString(userInfo.email),
    name: cleanString(userInfo.name),
    bio: cleanString(userInfo.bio),
    current_position: cleanString(userInfo.current_position),
    current_company: cleanString(userInfo.current_company),
    phone_number: cleanString(userInfo.phone_number),
    current_address: cleanString(userInfo.current_address),
    github_url: cleanString(userInfo.github_url),
    linkedin_url: cleanString(userInfo.linkedin_url),
    portrait_url: cleanString(userInfo.portrait_url),
    resume_url: cleanString(userInfo.resume_url),
    transcript_url: cleanString(userInfo.transcript_url),
    facebook_url: cleanString(userInfo.facebook_url),
    instagram_url: cleanString(userInfo.instagram_url),
    x_url: cleanString(userInfo.x_url),

    skills: userInfo.skills
      .map((skill) => ({
        name: cleanRequiredString(skill.name),
        proficiency: skill.proficiency,
        years_of_experience: skill.years_of_experience,
      }))
      .filter((skill) => skill.name.length > 0)
      .sort((a, b) => {
        const proficiencyCompare = compareNullableNumbersDesc(
          a.proficiency,
          b.proficiency,
        );
        if (proficiencyCompare !== 0) return proficiencyCompare;

        const yearsCompare = compareNullableNumbersDesc(
          a.years_of_experience,
          b.years_of_experience,
        );
        if (yearsCompare !== 0) return yearsCompare;

        return a.name.localeCompare(b.name);
      }),

    experiences: userInfo.experiences
      .map((experience) => ({
        company: cleanRequiredString(experience.company),
        job_title: cleanRequiredString(experience.job_title),
        date_start: formatRequiredReadableDate(experience.date_start),
        date_end: formatReadableDate(experience.date_end),
        job_description: cleanRequiredString(experience.job_description),
      }))
      .filter(
        (experience) =>
          experience.company.length > 0 ||
          experience.job_title.length > 0 ||
          experience.job_description.length > 0,
      )
      .sort((a, b) =>
        compareDatesMostRecent(
          a.date_end,
          a.date_start,
          b.date_end,
          b.date_start,
        ),
      ),

    projects: userInfo.projects
      .map((project) => ({
        name: cleanRequiredString(project.name),
        date_start: formatRequiredReadableDate(project.date_start),
        date_end: formatRequiredReadableDate(project.date_end),
        languages_used: cleanStringArray(project.languages_used),
        frameworks_used: cleanStringArray(project.frameworks_used),
        technologies_used: cleanStringArray(project.technologies_used),
        description: cleanRequiredString(project.description),
        github_url: cleanString(project.github_url),
        demo_url: cleanString(project.demo_url),
      }))
      .filter(
        (project) => project.name.length > 0 || project.description.length > 0,
      )
      .sort((a, b) =>
        compareDatesMostRecent(
          a.date_end,
          a.date_start,
          b.date_end,
          b.date_start,
        ),
      ),

    education: userInfo.education
      .map((education) => ({
        degree: cleanRequiredString(education.degree),
        majors: education.majors.map((major) => major.trim()).filter(Boolean),
        minors: education.minors.map((minor) => minor.trim()).filter(Boolean),
        gpa: cleanString(education.gpa),
        institution: cleanRequiredString(education.institution),
        awards: education.awards.map((award) => award.trim()).filter(Boolean),
        year_start: education.year_start,
        year_end: education.year_end,
        courses: education.courses
          .map((course) => ({
            name: cleanRequiredString(course.name),
            grade: cleanString(course.grade),
            description: cleanString(course.description),
          }))
          .filter(
            (course) => course.name.length > 0 || course.description !== null,
          )
          .sort((a, b) => {
            const gradeCompare = gradeRank(b.grade) - gradeRank(a.grade);
            if (gradeCompare !== 0) return gradeCompare;
            return a.name.localeCompare(b.name);
          }),
      }))
      .filter(
        (education) =>
          education.degree.length > 0 ||
          education.institution.length > 0 ||
          education.majors.length > 0,
      )
      .sort((a, b) => {
        const primary = educationRecencyValue(b) - educationRecencyValue(a);
        if (primary !== 0) return primary;

        const secondary =
          (b.year_start ?? Number.NEGATIVE_INFINITY) -
          (a.year_start ?? Number.NEGATIVE_INFINITY);
        if (secondary !== 0) return secondary;

        return a.institution.localeCompare(b.institution);
      }),
  };
}
