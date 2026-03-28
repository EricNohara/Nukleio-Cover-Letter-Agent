import React from "react";
import { IUserInfo } from "../interfaces/IUserInfoResponse";

export function AwesomeCVResumeTemplate({
    userInfo,
}: {
    userInfo: IUserInfo;
}) {
    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <style>{`
          @page {
            size: Letter;
            margin: 0.55in 0.65in 0.6in 0.65in;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #1f2937;
            font-family: "Helvetica Neue", Arial, sans-serif;
            font-size: 11.5px;
            line-height: 1.45;
          }

          .page {
            width: 100%;
          }

          .header {
            margin-bottom: 18px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .name {
            font-size: 40px;
            font-weight: 700;
            line-height: 1.1;
            color: black;
            margin: 0 0 4px 0;
            letter-spacing: 0.2px;
          }

          .headline {
            color: #bf2d22;
          }

          .address {
            font-style: italic;
            font-size: 11px;
            color: #636363;
          }

          .contact {
            font-size: 11px;
            line-height: 1.5;
          }

          .section {
            margin-top: 18px;
            page-break-inside: avoid;
          }

          .section-title {
            font-size: 20px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #bf2d22;
            margin: 0 0 10px 0;
            padding-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 12px;
            white-space: nowrap;
        }

        .section-divider {
            flex: 1;
            border-bottom: 1.5px solid black;
        }

          .entry {
            margin-bottom: 14px;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .entry-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 2px;
          }

          .entry-title {
            font-size: 14px;
            font-weight: 700;
            color: black;
            margin: 0;
          }

          .entry-date {
            font-size: 10.5px;
            color: #bf2d22;
            white-space: nowrap;
            text-align: right;
            margin-top: 1px;
          }

          .entry-subtitle {
            font-size: 10px;
            color: #4b5563;
            margin: 0 0 5px 0;
            font-weight: 500;
          }

          .entry-meta {
            color: #6b7280;
          }

          ul {
            margin: 6px 0 0 18px;
            padding: 0;
          }

          li {
            margin-bottom: 4px;
          }

          .skills-list {
            color: #374151;
          }

          .education-details
           {
            color: #4b5563;
            margin-top: 2px;
          }

          .muted {
            color: #6b7280;
          }

          a {
            color: inherit;
            text-decoration: none;
          }
        `}</style>
            </head>
            <body>
                <div className="page">
                    <header className="header">
                        <h1 className="name">{userInfo.name}</h1>

                        {(userInfo.current_company || userInfo.current_position) && (
                            <div className="headline">
                                {[userInfo.current_position, userInfo.current_company]
                                    .filter(Boolean)
                                    .join(" · ")
                                    .toUpperCase()}
                            </div>
                        )}

                        {userInfo.current_address && <div className="address">{userInfo.current_address}</div>}

                        <div className="contact">
                            {[userInfo.phone_number, userInfo.email, userInfo.github_url, userInfo.linkedin_url]
                                .filter(Boolean)
                                .join(" | ")}
                        </div>
                    </header>

                    {userInfo.experiences.length > 0 && (
                        <section className="section">

                            <div className="section-title">
                                Work Experience
                                <div className="section-divider" />
                            </div>

                            {userInfo.experiences.map((exp, i) => (
                                <div className="entry" key={i}>
                                    <div className="entry-top">
                                        <div>
                                            <div className="entry-title">{exp.company}</div>
                                            <div className="entry-subtitle">{exp.job_title}</div>
                                        </div>
                                        <div className="entry-date">
                                            {exp.date_start} - {exp.date_end ?? "Present"}
                                        </div>
                                    </div>

                                    {exp.job_description.length > 0 && (
                                        <ul>
                                            <li>{exp.job_description}</li>
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {userInfo.projects.length > 0 && (
                        <section className="section">
                            <div className="section-title">
                                Projects
                                <div className="section-divider" />
                            </div>

                            {userInfo.projects.map((project, i) => (
                                <div className="entry" key={i}>
                                    <div className="entry-top">
                                        <div>
                                            <div className="entry-title">{project.name}</div>
                                            <div className="entry-subtitle">{project.languages_used?.join(" | ")}</div>
                                        </div>
                                        <div className="entry-date">
                                            {project.date_start} - {project.date_end ?? "Present"}
                                        </div>
                                    </div>

                                    {project.description.length > 0 && (
                                        <ul>
                                            <li>{project.description}</li>
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {userInfo.education.length > 0 && (
                        <section className="section">
                            <div className="section-title">
                                Education
                                <div className="section-divider" />
                            </div>

                            {userInfo.education.map((edu, i) => (
                                <div className="entry" key={i}>
                                    <div className="entry-top">
                                        <div>
                                            <div className="entry-title">{edu.institution}</div>
                                            <div className="entry-subtitle">{edu.degree}</div>
                                        </div>
                                        <div className="entry-date">
                                            {edu.year_start} - {edu.year_end ?? "Present"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {userInfo.skills.length > 0 && (
                        <section className="section">
                            <div className="section-title">
                                Skills
                                <div className="section-divider" />
                            </div>
                            <div className="skills-list">{userInfo.skills.join(", ")}</div>
                        </section>
                    )}
                </div>
            </body>
        </html>
    );
}