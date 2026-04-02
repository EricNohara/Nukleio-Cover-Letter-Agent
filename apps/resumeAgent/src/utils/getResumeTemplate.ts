import { AwesomeCVResumeTemplate } from "../templates/AwesomeCVResumeTemplate";
import { DefaultResumeTemplate } from "../templates/DefaultResumeTemplate";
import { UNCResumeTemplate } from "../templates/UNCResumeTemplate";

export type ResumeTemplateId = "default";

export function getResumeTemplate(templateId?: string) {
  switch (templateId) {
    case "default":
      return DefaultResumeTemplate;
    case "unc":
      return UNCResumeTemplate;
    case "awesomecv":
      return AwesomeCVResumeTemplate;
    case undefined:
    default:
      return DefaultResumeTemplate;
  }
}
