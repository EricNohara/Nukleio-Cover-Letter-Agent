import React from "react";
import { IResumeDocument } from "../interfaces/IResumeDocument";

export function DefaultResumeTemplate({
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
            margin: 0.5in;
          }

          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #111;
          }

          h1 {
            font-size: 26px;
            margin-bottom: 4px;
          }

          h2 {
            font-size: 13px;
            margin-top: 18px;
            margin-bottom: 6px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 2px;
            text-transform: uppercase;
          }

          .contact {
            font-size: 11px;
            margin-bottom: 12px;
          }

          .headline {
            font-size: 12px;
            margin-bottom: 10px;
            color: #333;
          }

          .entry {
            margin-bottom: 10px;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .entry-header {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            font-weight: 600;
          }

          .entry-header-left {
            flex: 1;
          }

          .entry-header-right {
            white-space: nowrap;
          }

          .subtitle {
            font-size: 11px;
            color: #444;
            margin-top: 2px;
          }

          ul {
            margin: 4px 0 0 18px;
            padding: 0;
          }

          li {
            margin-bottom: 3px;
          }
        `}</style>
            </head>

            <body>
                <h1>{resume.contact.name}</h1>

                <div className="contact">
                    {[resume.contact.email, resume.contact.phone, resume.contact.address]
                        .filter(Boolean)
                        .join(" • ")}
                </div>

                {resume.contact.headline && (
                    <div className="headline">{resume.contact.headline}</div>
                )}

                {resume.summary && (
                    <section>
                        <h2>Summary</h2>
                        <div>{resume.summary}</div>
                    </section>
                )}

                {resume.experience.length > 0 && (
                    <section>
                        <h2>Experience</h2>
                        {resume.experience.map((exp, i) => (
                            <div className="entry" key={i}>
                                <div className="entry-header">
                                    <div className="entry-header-left">
                                        {exp.title} — {exp.company}
                                    </div>
                                    <div className="entry-header-right">
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
                    <section>
                        <h2>Projects</h2>
                        {resume.projects.map((project, i) => (
                            <div className="entry" key={i}>
                                <div className="entry-header">
                                    <div className="entry-header-left">{project.name}</div>
                                    <div className="entry-header-right"></div>
                                </div>

                                {project.subtitle && (
                                    <div className="subtitle">{project.subtitle}</div>
                                )}

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

                {resume.skills.length > 0 && (
                    <section>
                        <h2>Skills</h2>
                        <div>{resume.skills.join(", ")}</div>
                    </section>
                )}

                {resume.education.length > 0 && (
                    <section>
                        <h2>Education</h2>
                        {resume.education.map((edu, i) => (
                            <div className="entry" key={i}>
                                <div className="entry-header">
                                    <div className="entry-header-left">
                                        {edu.degree} — {edu.institution}
                                    </div>
                                    <div className="entry-header-right">
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
            </body>
        </html>
    );
}