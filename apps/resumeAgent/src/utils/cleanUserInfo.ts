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

function todayTimestamp(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function getEffectiveEndDateValue(endDate: string | null | undefined): number {
  const cleaned = cleanString(endDate);

  // No end date means current, so treat it as today.
  if (!cleaned) {
    return todayTimestamp();
  }

  return parseDateValue(cleaned);
}

function compareByMostRecentEndDate(
  aEnd: string | null | undefined,
  aStart: string | null | undefined,
  bEnd: string | null | undefined,
  bStart: string | null | undefined,
): number {
  const aEndValue = getEffectiveEndDateValue(aEnd);
  const bEndValue = getEffectiveEndDateValue(bEnd);

  // Primary sort: most recent end date first.
  if (bEndValue !== aEndValue) {
    return bEndValue - aEndValue;
  }

  const aStartValue = parseDateValue(aStart);
  const bStartValue = parseDateValue(bStart);

  // Tiebreaker: most recent start date first.
  if (bStartValue !== aStartValue) {
    return bStartValue - aStartValue;
  }

  return 0;
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
  const cleaned = cleanString(grade);
  if (!cleaned) return -1;

  // Numeric grades like "95" or "88.5"
  const numeric = Number(cleaned);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  // Letter grades
  const normalized = cleaned.toUpperCase().replace(/\s+/g, "");

  const ranks: Record<string, number> = {
    "A+": 100,
    A: 95,
    "A-": 90,
    "B+": 87,
    B: 83,
    "B-": 80,
    "C+": 77,
    C: 73,
    "C-": 70,
    "D+": 67,
    D: 63,
    "D-": 60,
    F: 0,
  };

  return ranks[normalized] ?? -1;
}

function filterByIds<T extends { id: string }>(
  items: T[],
  ids?: string[],
): T[] {
  if (!ids) return items;
  const idSet = new Set(ids);
  return items.filter((item) => idSet.has(item.id));
}

export function cleanUserInfo(
  userInfo: IUserInfo,
  educationIds?: string[] | undefined,
  courseIds?: string[] | undefined,
  experienceIds?: string[] | undefined,
  projectIds?: string[] | undefined,
  skillIds?: string[] | undefined,
): IUserInfo {
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

    skills: filterByIds(userInfo.skills, skillIds)
      .map((skill) => ({
        id: skill.id,
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

    experiences: filterByIds(userInfo.experiences, experienceIds)
      .map((experience) => ({
        id: experience.id,
        company: cleanRequiredString(experience.company),
        job_title: cleanRequiredString(experience.job_title),
        date_start: formatRequiredReadableDate(experience.date_start),
        date_end: formatReadableDate(experience.date_end),
        _raw_date_start: cleanRequiredString(experience.date_start),
        _raw_date_end: cleanString(experience.date_end),
        job_description: cleanRequiredString(experience.job_description),
      }))
      .filter(
        (experience) =>
          experience.company.length > 0 ||
          experience.job_title.length > 0 ||
          experience.job_description.length > 0,
      )
      .sort((a, b) =>
        compareByMostRecentEndDate(
          a._raw_date_end,
          a._raw_date_start,
          b._raw_date_end,
          b._raw_date_start,
        ),
      )
      .map(({ _raw_date_start, _raw_date_end, ...experience }) => experience),

    projects: filterByIds(userInfo.projects, projectIds)
      .map((project) => {
        const rawDateEnd = cleanRequiredString(project.date_end);

        return {
          id: project.id,
          name: cleanRequiredString(project.name),
          date_start: formatRequiredReadableDate(project.date_start),
          date_end: formatRequiredReadableDate(project.date_end),
          _raw_date_start: cleanRequiredString(project.date_start),
          _raw_date_end: rawDateEnd,
          languages_used: cleanStringArray(project.languages_used),
          frameworks_used: cleanStringArray(project.frameworks_used),
          technologies_used: cleanStringArray(project.technologies_used),
          description: cleanRequiredString(project.description),
          github_url: cleanString(project.github_url),
          demo_url: cleanString(project.demo_url),
        };
      })
      .filter(
        (project) => project.name.length > 0 || project.description.length > 0,
      )
      .sort((a, b) =>
        compareByMostRecentEndDate(
          a._raw_date_end,
          a._raw_date_start,
          b._raw_date_end,
          b._raw_date_start,
        ),
      )
      .map(({ _raw_date_start, _raw_date_end, ...project }) => project),

    education: filterByIds(userInfo.education, educationIds)
      .map((education) => ({
        id: education.id,
        degree: cleanRequiredString(education.degree),
        majors: education.majors.map((major) => major.trim()).filter(Boolean),
        minors: education.minors.map((minor) => minor.trim()).filter(Boolean),
        gpa: cleanString(education.gpa),
        institution: cleanRequiredString(education.institution),
        awards: education.awards.map((award) => award.trim()).filter(Boolean),
        year_start: education.year_start,
        year_end: education.year_end,
        courses: filterByIds(education.courses, courseIds)
          .map((course) => ({
            id: course.id,
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
