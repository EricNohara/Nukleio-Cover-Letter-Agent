# Nukleio AI Agents

This repo contains three Lambda-backed agents:

- Resume Agent
- Cover Letter Agent
- Professional Headshot Agent

All agents accept JSON request bodies. Successful responses use HTTP 200. Validation or runtime errors are returned as HTTP 400 with:

```ts
{
  success: false;
  error: string;
}
```

Unknown routes return HTTP 404 with:

```ts
{
  success: false;
  error: "Route not found";
}
```

## Shared Resume UserInfo Schema

Used by the Resume Agent.

```ts
type ResumeUserInfo = {
  email: string;
  name?: string;
  bio?: string;
  phone_number?: string;
  current_address?: string;
  current_position?: string;
  current_company?: string;
  github_url?: string;
  linkedin_url?: string;
  portrait_url?: string;
  resume_url?: string;
  transcript_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  x_url?: string;

  skills: {
    name: string;
    proficiency?: number;
    years_of_experience?: number;
  }[];

  experiences: {
    company: string;
    job_title: string;
    date_start: string;
    date_end?: string;
    job_description: string;
  }[];

  projects: {
    name: string;
    date_start: string;
    date_end: string;
    languages_used?: string[];
    frameworks_used?: string[];
    technologies_used?: string[];
    description: string;
    github_url?: string;
    demo_url?: string;
  }[];

  education: {
    degree: string;
    majors: string[];
    minors: string[];
    gpa?: string;
    institution: string;
    awards: string[];
    year_start: number;
    year_end?: number;
    courses: {
      name: string;
      grade?: string;
      description?: string;
    }[];
  }[];
};
```

## Shared Cover Letter UserInfo Schema

Used by the Cover Letter Agent.

```ts
type CoverLetterUserInfo = {
  email: string;
  name?: string;
  bio?: string;
  phone_number?: string;
  current_address?: string;
  current_position?: string;
  current_company?: string;

  skills?: string[];

  experiences?: {
    company: string;
    job_title: string;
    job_description: string;
  }[];

  projects?: {
    name: string;
    tech?: string[];
    description: string;
  }[];

  education?: {
    degree: string;
    fields_of_study?: string[];
    institution: string;
    courses?: string[];
  }[];
};
```

## Resume Agent

### POST /generate

Generates a resume PDF from the provided user info and selected template.

Request:

```ts
{
  userId: string;
  userInfo: ResumeUserInfo;
  templateId?: string;
}
```

Response:

```ts
{
  success: true;
  resumeUrl: string;
}
```

### POST /generateAi

Enhances and filters the provided user info with AI, then generates a resume PDF.

Request:

```ts
{
  userId: string;
  userInfo: ResumeUserInfo;
  templateId?: string;
  targetJobs?: string[];
}
```

Response:

```ts
{
  success: true;
  resumeUrl: string;
}
```

## Cover Letter Agent

### POST /generate

Researches the job, filters user info for that job, drafts a cover letter, evaluates/revises it, and returns session data.

Request:

```ts
{
  userId: string;
  userInfo: CoverLetterUserInfo;
  jobTitle: string;
  companyName: string;
  jobDescriptionDump: string;
  writingSample?: string;
}
```

Response:

```ts
{
  jobData: JobInfo;
  writingAnalysis: WritingAnalysis | null;
  writingSample: string | undefined;
  currentDraft: string;
  skillsMatchScore: number;
}
```

Supporting response types:

```ts
type JobInfo = {
  job_title: string;
  work_mode?: "remote" | "hybrid" | "onsite";
  locations?: string[];
  qualifications?: string[];
  responsibilities?: string[];
  technologies?: string[];
  company: {
    name: string;
    industry?: string;
    company_summary?: string;
  };
  hiring_team?: {
    name?: string;
  }[];
};

type WritingAnalysis = {
  avgSentenceLength: number;
  avgSyllablesPerWord: number;
  fleschKincaidGrade: number;
  punctuationComplexity: number;
  textStandard: number;
  tone: {
    formality: "formal" | "casual" | "professional" | "conversational";
    confidence: "tentative" | "assertive" | "persuasive";
    sentiment: "positive" | "neutral" | "negative";
  };
  sentencePatterns: {
    structure: "simple" | "compound" | "complex" | "mixed";
    variedPacing: "low" | "medium" | "high";
  };
  cohesion: {
    paragraphLength: "short" | "medium" | "long";
    connectors: string[];
  };
};
```

### POST /revise

Revises an existing cover letter draft from session data and user feedback.

Request:

```ts
{
  userInfo: CoverLetterUserInfo;
  session: {
    jobData: JobInfo;
    writingAnalysis: WritingAnalysis | null;
    writingSample: string | null;
    currentDraft: string;
  };
  feedback: string;
}
```

Response:

```ts
{
  revisedDraft: string;
  draftName: string;
}
```

## Professional Headshot Agent

### POST /generate

Validates a reference photo, generates a professional headshot, uploads it, and returns its public URL.

Request:

```ts
{
  referenceUrl: string;
  backgroundDescription: string | null;
  backgroundUrl?: string;
  attire:
    | "auto"
    | "business"
    | "businessCasual"
    | "smartCasual"
    | "casual"
    | "techProfessional"
    | "academic";
  layout: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
}
```

Success response:

```ts
{
  success: true;
  publicUrl: string;
  validation: ReferencePhotoValidationResult;
}
```

Validation or generation failure response:

```ts
{
  success: false;
  publicUrl: null;
  error: string;
  validation: ReferencePhotoValidationResult;
}
```

### POST /revise

Validates an existing headshot, revises it from feedback, uploads it, and returns its public URL.

Request:

```ts
{
  headshotUrl: string;
  feedback: string;
  layout: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
}
```

Success response:

```ts
{
  success: true;
  publicUrl: string;
  validation: ReferencePhotoValidationResult;
}
```

Validation or generation failure response:

```ts
{
  success: false;
  publicUrl: null;
  error: string;
  validation: ReferencePhotoValidationResult;
}
```

Supporting response type:

```ts
type ReferencePhotoValidationResult = {
  ok: boolean;
  failureReasons: string[];
  warnings: string[];
  detected: {
    personCount: number;
    faceVisible: boolean;
    faceTooCropped: boolean;
    lookingAtCamera: boolean;
    nonPhotographic: boolean;
    nsfwContent: boolean;
    tooBlurry: boolean;
  };
};
```
