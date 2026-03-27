import { DefaultResumeTemplate } from "../templates/DefaultResumeTemplate";

export type ResumeTemplateId = "default";

export function getResumeTemplate(templateId?: string) {
  switch (templateId) {
    case "default":
      return DefaultResumeTemplate;
    //   add in more templates later
    case undefined:
    default:
      return DefaultResumeTemplate;
  }
}
