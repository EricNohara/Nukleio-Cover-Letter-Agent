import React from "react";
import { IResumeDocument } from "../interfaces/IResumeDocument";

export function AwesomeCVResumeTemplate({
    resume,
}: {
    resume: IResumeDocument;
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
          }

          .name {
            font-size: 30px;
            font-weight: 700;
            line-height: 1.1;
            color: #111827;
            margin: 0 0 4px 0;
            letter-spacing: 0.2px;
          }

          .headline {
            font-size: 14px;
            color: #4b5563;
            margin: 0 0 8px 0;
            font-weight: 500;
          }

          .contact {
            font-size: 10.5px;
            color: #4b5563;
            line-height: 1.5;
          }

          .section {
            margin-top: 18px;
            page-break-inside: avoid;
          }

          .section-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #111827;
            margin: 0 0 10px 0;
            padding-bottom: 4px;
            border-bottom: 1.5px solid #d1d5db;
          }

          .summary {
            color: #374151;
            margin: 0;
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
            font-size: 13px;
            font-weight: 700;
            color: #111827;
            margin: 0;
          }

          .entry-date {
            font-size: 10.5px;
            color: #4b5563;
            white-space: nowrap;
            text-align: right;
            margin-top: 1px;
          }

          .entry-subtitle {
            font-size: 11px;
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

          .education-details,
          .project-subtitle {
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
                        <h1 className="name">{resume.contact.name}</h1>

                        {resume.contact.headline && (
                            <div className="headline">{resume.contact.headline}</div>
                        )}

                        <div className="contact">
                            {[resume.contact.address, resume.contact.phone, resume.contact.email]
                                .filter(Boolean)
                                .join(" | ")}
                        </div>
                    </header>

                    {resume.summary && (
                        <section className="section">
                            <div className="section-title">Summary</div>
                            <p className="summary">{resume.summary}</p>
                        </section>
                    )}

                    {resume.experience.length > 0 && (
                        <section className="section">
                            <div className="section-title">Work Experience</div>

                            {resume.experience.map((exp, i) => (
                                <div className="entry" key={i}>
                                    <div className="entry-top">
                                        <div>
                                            <div className="entry-title">{exp.company}</div>
                                            <div className="entry-subtitle">{exp.title}</div>
                                        </div>
                                        <div className="entry-date">
                                            {exp.startDate} - {exp.endDate}
                                        </div>
                                    </div>

                                    {exp.bullets.length > 0 && (
                                        <ul>
                                            {exp.bullets.map((bullet, j) => (
                                                <li key={j}>{bullet}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {resume.projects.length > 0 && (
                        <section className="section">
                            <div className="section-title">Projects</div>

                            {resume.projects.map((project, i) => (
                                <div className="entry" key={i}>
                                    <div className="entry-top">
                                        <div>
                                            <div className="entry-title">{project.name}</div>
                                            {project.subtitle && (
                                                <div className="project-subtitle">{project.subtitle}</div>
                                            )}
                                        </div>
                                    </div>

                                    {project.bullets.length > 0 && (
                                        <ul>
                                            {project.bullets.map((bullet, j) => (
                                                <li key={j}>{bullet}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {resume.education.length > 0 && (
                        <section className="section">
                            <div className="section-title">Education</div>

                            {resume.education.map((edu, i) => (
                                <div className="entry" key={i}>
                                    <div className="entry-top">
                                        <div>
                                            <div className="entry-title">{edu.institution}</div>
                                            <div className="entry-subtitle">{edu.degree}</div>
                                        </div>
                                        <div className="entry-date">
                                            {edu.startYear} - {edu.endYear}
                                        </div>
                                    </div>

                                    {edu.details.length > 0 && (
                                        <ul>
                                            {edu.details.map((detail, j) => (
                                                <li key={j}>{detail}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}

                    {resume.skills.length > 0 && (
                        <section className="section">
                            <div className="section-title">Skills</div>
                            <div className="skills-list">{resume.skills.join(", ")}</div>
                        </section>
                    )}
                </div>
            </body>
        </html>
    );
}