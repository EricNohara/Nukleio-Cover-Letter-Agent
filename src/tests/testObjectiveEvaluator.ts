import { IObjectiveEvaluationResult } from "../interfaces/IEvaluator";
import { objectiveEvaluator } from "../utils/eval/objectiveEvaluator";
import fs from "fs";
import path from "path";
import { ITheirStackJob } from "../interfaces/ITheirStackResponse";
import { IUserInfo } from "../interfaces/IUserInfoResponse";
import { WritingAnalysis } from "../utils/writing/writingSchema";

const draft =
  "Eric Nohara-LeClair  \n75 Sandy Ridge Court  \nPhone: 636-317-9533  \nEmail: ernohara@bu.edu  \n\nNovember 27, 2025  \n\nMr. Don Caluya  \nBoeing Intelligence & Analytics  \nAnnapolis Junction, MD  \n\nDear Mr. Caluya,\n\nI am writing to express my interest in the Senior Software Engineer position at Boeing Intelligence & Analytics. I’m currently a rising senior and combined BA/MS student in Computer Science at Boston University, working as a software developer and graduate student. While I do not yet meet the seniority level or years-of-experience requirements listed, I am very drawn to BI&A’s mission in intelligence and analytics, and to the kind of technically demanding, systems-focused work described in the posting. I’d be grateful to be considered for any current or future role that better matches my level, including junior or mid-level software engineer positions.\n\nMy background is deeply rooted in systems, backend development, and applied analytics. Academically, I’ve completed rigorous coursework in distributed systems (CS 350), operating systems and systems programming (CS 410), embedded systems (CS 654), algorithms (CS 330, CS 392), AI (CS 440), and databases (CS 460), all with top grades. I work comfortably in Linux and C, Java, Python, and JavaScript/TypeScript, and I’m used to thinking about performance, reliability, and correctness, not just getting something to “work.” This has shaped how I approach problems: I tend to start from the system boundary and data flows, then work down to the implementation details.\n\nOn the practical side, my recent internship at Dot Foods gave me hands-on experience with production software in an Agile environment. I contributed to backend development in C# and .NET, built and tuned SQL Server queries, and participated in daily standups and iterative delivery. I also helped strengthen the team’s DevOps culture by building a Grafana dashboard to visualize DORA metrics, which pushed me to think about software not only as code, but as an evolving system that needs observability and measurable improvement. In my current role as a Robotic Process Automation Developer at Dot Foods, I build and deploy automation with UiPath and .NET technologies to streamline workflows, implement robust error handling and logging, and collaborate closely with non-technical stakeholders to understand real operational constraints. These experiences line up well with the job’s emphasis on integrating new and legacy systems, handling complex workflows, and rigorously reviewing and testing software components.\n\nOutside of work, I’ve taken on projects that echo some of the challenges in your description: processing-intensive logic, real-time behavior, and integrating software across different hardware and services. For example, I built a Java-based Course Admin Grading App with a Swing GUI and SQLite backend for multi-role course management, including secure password handling, email notifications via SMTP, and extensive testing of database and UI behavior. In another project, a webserver-integrated Arduino attendance tracker, I wrote a C-based HTTP server handling CGI scripts and async data from an Arduino, with real-time plotting via AJAX and email alerts. More recently, I’ve focused on modern web and cloud tools: a Next.js/Tailwind portfolio system backed by Supabase and AWS Lambda, and “TripSync,” a Node.js/Express backend with MongoDB, AWS S3 integration, and JWT-based auth. Throughout all of this, I’ve relied on Git and GitHub for version control, and I use Jira and Confluence routinely for task tracking and documentation. While I don’t yet have RF signal processing or SDR experience, I’m very interested in that domain and comfortable learning new technical stacks quickly.\n\nI know I’m earlier in my career than your typical Senior Software Engineer candidate, but the kind of mission-driven, technically deep work BI&A does is exactly where I want to grow. If there is a more junior role, a pipeline position, or even an upcoming opening where a strong systems-oriented developer with a serious academic foundation and real-world experience could contribute, I would really appreciate the chance to be considered.\n\nThank you for taking the time to review my application. I’d welcome the opportunity to discuss how my background in systems, analytics, and full-stack development could support BI&A’s programs now or in the near future.\n\nSincerely,  \n\nEric Nohara-LeClair";

function loadJSON<T>(file: string): T {
  const fullPath = path.join(__dirname, "../../testData", file);
  const raw = fs.readFileSync(fullPath, "utf8");
  return JSON.parse(raw) as T;
}

const test = async () => {
  const userData = loadJSON<IUserInfo>("userInfo.json");
  const jobData = loadJSON<ITheirStackJob>("jobApiResponse.json");
  const writingAnalysis = loadJSON<WritingAnalysis>("writingAnalysis.json");
  const output: IObjectiveEvaluationResult = await objectiveEvaluator(
    draft,
    userData,
    jobData,
    writingAnalysis
  );

  console.log(output);
};

test();
