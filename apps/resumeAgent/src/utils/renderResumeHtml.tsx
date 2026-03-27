import { renderToStaticMarkup } from "react-dom/server";
import { IResumeDocument } from "../interfaces/IResumeDocument";
import { getResumeTemplate } from "./getResumeTemplate";

export function renderResumeHtml(
  resume: IResumeDocument,
  templateId?: string,
): string {
  const Template = getResumeTemplate(templateId);
  return "<!DOCTYPE html>" + renderToStaticMarkup(<Template resume={resume} />);
}