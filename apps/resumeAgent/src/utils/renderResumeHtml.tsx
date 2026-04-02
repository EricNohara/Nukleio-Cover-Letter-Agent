import { renderToStaticMarkup } from "react-dom/server";
import { getResumeTemplate } from "./getResumeTemplate";
import { IUserInfo } from "../interfaces/IUserInfoResponse";

export function renderResumeHtml(
  userInfo: IUserInfo,
  templateId?: string,
): string {
  const Template = getResumeTemplate(templateId);
  return "<!DOCTYPE html>" + renderToStaticMarkup(<Template userInfo={userInfo} />);
}