// import fs from "fs";
// import path from "path";
// import { ILlmEvaluationResult } from "../interfaces/IEvaluator";
// import llmEvaluator from "../utils/eval/llmEvaluator";
// import OpenAI from "openai";
// import getOpenAIClient from "../utils/ai/getOpenAIClient";

// const draft =
//   "Eric Nohara-LeClair  \n75 Sandy Ridge Court  \nPhone: 636-317-9533  \nEmail: ernohara@bu.edu  \n\nNovember 27, 2025  \n\nJames Green  \nTechnology Recruiter  \nEnvision  \n\nDear Mr. Green,\n\nI’m writing to express my interest in the Javascript Developer position with your client in St. Louis. I grew up in the area and am currently a rising senior and master’s student in Computer Science at Boston University, with a strong focus on full‑stack web development. I’m planning to return to St. Louis and would be excited to contribute onsite to a close, collaborative team.\n\nOver the past several years, I’ve built and maintained full‑stack applications using JavaScript, TypeScript, HTML, CSS, and modern frameworks. As Website Coordinator Leader for Kappa Theta Pi, I lead a small frontend team using HTML, CSS, and JavaScript to design and maintain our public site, balancing aesthetics with performance and clarity of information. In my personal projects, I’ve used React, Next.js, Node.js, Express, and Handlebars to implement REST APIs, server‑side rendering, and responsive, mobile‑friendly interfaces. My TripSync project, for example, combines a JavaScript/Express backend with MongoDB, AWS S3, and secure authentication—experience that translates well to building Angular front ends backed by .NET Core Web APIs and SQL Server.\n\nThis past summer at Dot Foods, I worked as a Software Engineer Intern using C#, .NET, Azure Function Apps, and Microsoft SQL Server. I wrote and optimized SQL queries, contributed to backend services, and helped build a Grafana dashboard for DORA metrics, which sharpened my sense for reliability, performance, and data‑driven improvement. While I haven’t used Angular professionally yet, I’m comfortable picking up new frameworks and already work daily with component‑based front ends and RESTful backends.\n\nI’d appreciate the chance to discuss how my mix of JavaScript, .NET, and SQL experience could support your client’s internal and customer‑facing applications.\n\nSincerely,  \n\nEric Nohara-LeClair";

// function loadJSON<T>(file: string): T {
//   const fullPath = path.join(__dirname, "../../testData", file);
//   const raw = fs.readFileSync(fullPath, "utf8");
//   return JSON.parse(raw) as T;
// }

// const test = async () => {
//   const clientOpenAI: OpenAI = getOpenAIClient();
//   const output: ILlmEvaluationResult = await llmEvaluator(
//     clientOpenAI,
//     "",
//     draft
//   );

//   console.log(output);
// };

// test();
