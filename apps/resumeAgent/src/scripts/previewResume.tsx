import fs from "fs";
import path from "path";
import { renderToStaticMarkup } from "react-dom/server";
import { IUserInfo } from "../interfaces/IUserInfoResponse";
import { cleanUserInfo } from "../utils/cleanUserInfo";
import { AwesomeCVResumeTemplate } from "../templates/AwesomeCVResumeTemplate";
import { DefaultResumeTemplate } from "../templates/DefaultResumeTemplate";

//  mock data
export const mockUserInfo: IUserInfo = {
    bio: "I'm a rising senior at Boston University pursuing a master's degree in Computer Science. I'm interested in computer systems, web and game development, and machine learning!",
    name: "Eric Nohara-LeClair",
    email: "ernohara@bu.edu",
    x_url: "",

    skills: [
        {
            id: "f7a73996-782c-4c7d-866a-137757dbf4f7",
            name: "AWS",
            proficiency: 8,
            years_of_experience: 3,
        },
        {
            id: "b88d17b3-88c4-426d-8990-f668acad1d18",
            name: "Azure",
            proficiency: 7,
            years_of_experience: 1,
        },
        {
            id: "4f1aa103-4175-4bd8-a067-110a121e6a1c",
            name: "C",
            proficiency: 8,
            years_of_experience: 4,
        },
        {
            id: "8532066d-da72-4448-98a4-08b1015129aa",
            name: "C#",
            proficiency: 9,
            years_of_experience: 2,
        },
        {
            id: "d899b336-f6d1-408a-a94a-6ffa52f34b99",
            name: "Confluence",
            proficiency: 8,
            years_of_experience: 1,
        },
        {
            id: "afb647f7-ded3-4dd3-bf1b-107739f39069",
            name: "Express.js",
            proficiency: 7,
            years_of_experience: 2,
        },
        {
            id: "0fac3d0d-dab9-4b49-a09b-2a654f21716e",
            name: "Firebase",
            proficiency: 8,
            years_of_experience: 2,
        },
        {
            id: "a4351173-5075-4acf-810e-713c346c5b72",
            name: "Git",
            proficiency: 9,
            years_of_experience: 5,
        },
        {
            id: "b52b0151-fe96-4c26-aa14-bfaf4d49eeef",
            name: "GitHub",
            proficiency: 9,
            years_of_experience: 5,
        },
        {
            id: "d19b543b-ba4a-4dbb-9670-1bfef75b7c02",
            name: "GitHub CI/CD",
            proficiency: 8,
            years_of_experience: 1,
        },
        {
            id: "db8800e5-e59f-43d9-8b69-94aa78a0b766",
            name: "Grafana",
            proficiency: 8,
            years_of_experience: 1,
        },
        {
            id: "df21b5cf-ec88-4a1d-95bd-c50a0be53138",
            name: "Handlebars",
            proficiency: 8,
            years_of_experience: 2,
        },
        {
            id: "556c4d0c-4cad-4c14-9d1b-8aaf25a278a7",
            name: "HTML + CSS",
            proficiency: 9,
            years_of_experience: 4,
        },
        {
            id: "3b8e70d5-72b1-4968-a485-dee06c95f34c",
            name: "Integration Testing",
            proficiency: 7,
            years_of_experience: 1,
        },
        {
            id: "d53988c4-42d1-4833-af66-6e9cb6ebe37b",
            name: "Java",
            proficiency: 9,
            years_of_experience: 5,
        },
        {
            id: "2d14eaf3-d9e4-45ab-a5ec-21a8d3d7e239",
            name: "JavaScript",
            proficiency: 8,
            years_of_experience: 4,
        },
        {
            id: "c32a3da5-4911-49a6-a746-764ab87dd75b",
            name: "Jira",
            proficiency: 9,
            years_of_experience: 1,
        },
        {
            id: "802a7458-422c-4b18-9635-f7b122e652f8",
            name: "K6 Load Testing",
            proficiency: 8,
            years_of_experience: 1,
        },
        {
            id: "874c8e03-0fb1-40b9-8f06-82b48bd5a41e",
            name: "Linux",
            proficiency: 8,
            years_of_experience: 3,
        },
        {
            id: "78ce2998-5e8a-4e94-85b6-5689b3527918",
            name: "MongoDB",
            proficiency: 8,
            years_of_experience: 2,
        },
        {
            id: "3d65d2e6-66d9-4f09-9c53-f1754001767e",
            name: "MSSQL Server",
            proficiency: 8,
            years_of_experience: 1,
        },
        {
            id: "de83f46a-7136-4f5e-a468-1859816ef5ec",
            name: ".NET",
            proficiency: 8,
            years_of_experience: 1,
        },
        {
            id: "6a308865-8d81-410b-a7e3-838ddd414d79",
            name: "Next.js",
            proficiency: 10,
            years_of_experience: 3,
        },
        {
            id: "4b106ca4-9657-43dd-8dff-a1e8ec9c092e",
            name: "Node.js",
            proficiency: 9,
            years_of_experience: 3,
        },
        {
            id: "3cad4ba8-8c38-4c1e-b056-8e7737d48389",
            name: "OCaml",
            proficiency: 6,
            years_of_experience: 1,
        },
        {
            id: "97897b95-32fc-47f3-b496-506afc7c6669",
            name: "PostgreSQL",
            proficiency: 8,
            years_of_experience: 1,
        },
        {
            id: "fa9932f6-b145-4b7d-ba04-8600cbd960de",
            name: "Python",
            proficiency: 8,
            years_of_experience: 5,
        },
        {
            id: "781f8ba6-17b9-48b8-8636-429ec08ae961",
            name: "React.js",
            proficiency: 8,
            years_of_experience: 3,
        },
        {
            id: "2008f2e1-e2bc-435b-9119-a4a637e3ee64",
            name: "SQL",
            proficiency: 9,
            years_of_experience: 3,
        },
        {
            id: "e00f80fe-1778-4911-9b36-bc4b9d8208db",
            name: "SQLite",
            proficiency: 9,
            years_of_experience: 2,
        },
        {
            id: "97340c09-72e0-4451-bcc6-f47a24b096dd",
            name: "Supabase",
            proficiency: 8,
            years_of_experience: 3,
        },
        {
            id: "b32234a4-334d-4eaa-8877-62f026fc29cf",
            name: "Tailwind",
            proficiency: 7,
            years_of_experience: 1,
        },
        {
            id: "ed6244d7-14ee-45d0-85c7-50c829eb2e33",
            name: "TypeScript",
            proficiency: 8,
            years_of_experience: 2,
        },
        {
            id: "89a325a0-bbf8-494a-b4f5-244b03864be3",
            name: "Unit Testing",
            proficiency: 7,
            years_of_experience: 1,
        },
        {
            id: "d25af553-8fed-41b9-9d04-54948c754871",
            name: "Windows",
            proficiency: 10,
            years_of_experience: 8,
        },
        {
            id: "37f12ceb-52d4-4bb0-8cbe-c2e448090955",
            name: "XML",
            proficiency: 8,
            years_of_experience: 2,
        },
        {
            id: "00dd4a8b-8d8b-4ea4-bdfe-f0c5ad5477ce",
            name: "YAML",
            proficiency: 8,
            years_of_experience: 1,
        },
    ],

    projects: [
        {
            id: "17a31f55-93b6-455d-9a3d-09d4fd758520",
            name: "Event Echo",
            date_end: "2025-12-29",
            demo_url:
                "https://drive.google.com/drive/folders/15LC87y1itksHIRGUsOX4qBqt_M4nZjGB?usp=sharing",
            date_start: "2025-09-01",
            github_url: "https://github.com/EricNohara/Event-Echo",
            description:
                "Event Echo is a memory-sharing map app for real-world events.\nAfter attending an event (concert, festival, lecture, etc.), users can create an event room (if one doesn’t already exist) and post one photo and one short reflection about their experience. Other attendees can join the same event room and add their own “echo” — a photo and thought — building a community-generated timeline and memory wall for that event. Over time, each event’s location becomes a shared memory space, where users can relive collective experiences and see different perspectives. Additionally, users can upvote or downvote contributions, with the best ones being pinned to the top and earning contributor points.",
            languages_used: ["Kotlin"],
            frameworks_used: ["Jetpack Compose"],
            technologies_used: [
                "Android",
                "Android Studio",
                "Ticketmaster",
                "Google Maps",
                "Cloud Firestore",
                "Firebase",
            ],
        },
        {
            id: "001c5129-3bbd-4caf-90d1-32f0c1bd5214",
            name: "FFOracle",
            date_end: "2025-12-21",
            demo_url: null,
            date_start: "2025-09-01",
            github_url: "https://github.com/EricNohara/FFOracle-Frontend",
            description:
                "A full-stack fantasy football analytics platform that provides AI-driven start/sit recommendations, player comparisons, and league performance tracking. The backend integrates real-time NFL data (NFLVerse, ESPN), custom league scoring settings, betting lines, game environments, defensive matchups, and more to generate personalized roster advice through a RESTful ASP.NET Core API. Built with .NET 8, C#, and PostgreSQL (and Supabase), with secure JWT authentication and Stripe payment integration. Deployed on Azure App Service, with the frontend deployed on Vercel and background workers deployed on AWS.",
            languages_used: ["C#", "Python", "TypeScript", "PostgreSQL"],
            frameworks_used: ["ASP.Net Core", "next.js", "Supabase"],
            technologies_used: [
                "Amazon Web Services (AWS)",
                "Microsoft Azure",
                "Vercel",
            ],
        },
        {
            id: "4dff51e6-2719-4675-baf5-c50a57970edb",
            name: "Managed Portfolio Website",
            date_end: "2025-06-26",
            demo_url: null,
            date_start: "2025-05-19",
            github_url: "https://github.com/EricNohara/Managed-Portfolio-Website",
            description:
                "Portfolio website built with Next.js and integrated with my Portfolio Website Manager's built in API to display important and relevant information for my portfolio website. Built to display content dynamically, allowing me to make changes in the portfolio editor and view those changes in my deployed portfolio website without having to change a single line of code.",
            languages_used: ["TypeScript", "CSS"],
            frameworks_used: ["Next.js", "Tailwind"],
            technologies_used: ["MUI", "Portfolio Website Manager"],
        },
        {
            id: "6f6d38c5-b250-4196-aadb-e92ba9765756",
            name: "Course Admin Grading App",
            date_end: "2025-05-10",
            demo_url: null,
            date_start: "2025-04-20",
            github_url: "https://github.com/EricNohara/CS-611-FINAL-PROJECT",
            description:
                "Created a comprehensive Java-based grading and course management system designed for college professors. It features a robust backend using SQLite for data storage and supports user roles such as students, teachers, graders, and admins. The system enables teachers to manage courses, assignments, and grading templates efficiently, with support for copying course structures across semesters. It provides a user-friendly Swing-based UI for managing users, courses, assignments, submissions, and grades, as well as tools for grade statistics and file uploads. The application includes utilities for database backup and restoration, email notifications, and secure password handling. Extensive testing was performed on database operations, UI functionality, and file management to ensure reliability.",
            languages_used: ["Java"],
            frameworks_used: ["Swing (GUI)"],
            technologies_used: ["SQLite", "SMTP"],
        },
        {
            id: "7336ee41-e866-48dc-bb3a-57e93804fd93",
            name: "Nukleio",
            date_end: "2026-03-29",
            demo_url: "https://www.nukleio.com",
            date_start: "2024-10-31",
            github_url: "https://github.com/EricNohara/Portfolio-Website-Editor-Supabase",
            description:
                "Created an all-in-one solution for portfolio website management, enabling users to update their portfolios without modifying any source code. It features a UI for adding, editing, or deleting user information and provides a robust API for requesting user data in one place. Designed for seamless integration with existing portfolios, the platform allows developers to fetch up-to-date information with a single request, eliminating manual updates and ensuring that changes are automatically pushed to sites connected to the API. It uses a custom AWS lambda function to bypass the Supabase free tier by calling the public endpoint on a periodic time trigger.",
            languages_used: ["TypeScript", "Python", "CSS"],
            frameworks_used: ["Next.js", "Node.js"],
            technologies_used: ["Vercel", "Supabase", "AWS Lambda", "Redis"],
        },
        {
            id: "5c8d81c4-bf55-4429-9b3e-e9a4bc1693d8",
            name: "TripSync",
            date_end: "2024-08-11",
            demo_url: "https://tripsync-zh42.onrender.com/",
            date_start: "2024-07-01",
            github_url: "https://github.com/EricNohara/TripSync",
            description:
                "Implemented REST API backend using Node.js with Express, stored user data using MongoDB, integrated cloud storage with AWS (S3), handled authentication with JWT, and utilized Handlebars for server-side rendering. Supports registration, sign in, 2 factor auth, file storage and sharing with similar functionality to Google Drive.",
            languages_used: ["JavaScript"],
            frameworks_used: ["Node.js", "Express.js", "Handlebars"],
            technologies_used: ["MongoDB", "AWS"],
        },
        {
            id: "804fdf97-ec30-4d67-9156-813aff87020c",
            name: "Webserver Integrated Arduino Attendance Tracker",
            date_end: "2024-05-10",
            demo_url:
                "https://drive.google.com/drive/folders/1SGPjzqW3uOtwZvEsnllC91_HD7ibE_Vc?usp=sharing",
            date_start: "2024-01-10",
            github_url:
                "https://github.com/EricNohara/Webserver-Integrated-Arduino-Attendance-Tracker",
            description:
                "Simple webserver written in C using socket library interface. Handles HTTP requests, HTML error codes, and can run server side CGI scripts. Hardware is an Arduino driven device using ultrasonic sensors that tracks the current attendance in a room and communicates with the webserver via serial communication, sending or receiving data from the client side. Supports async data handling, real-time data plotting utilizing AJAX requests, and email sending via the SMTP protocol.",
            languages_used: ["C", "Python", "Javascript", "HTML", "CSS", "Perl"],
            frameworks_used: ["C Socket Interface"],
            technologies_used: ["Arduino"],
        },
        {
            id: "bc5b240d-e677-499c-998b-4b14348e51a1",
            name: "Daily Workout SMS Sender",
            date_end: "2024-01-01",
            demo_url: null,
            date_start: "2023-12-01",
            github_url: "https://github.com/EricNohara/Python-SMS-Workout_Sender",
            description:
                "Python script which makes use of smtplib to send SMS messages to my phone and pandas library to read data from a public google sheets file with data about my workouts. Script will locate the current workout for the day and send it to my phone with an accompanying image. Set up with Windows Task Scheduler to send daily updates. More details and usage guide available on GitHub page.",
            languages_used: ["Python"],
            frameworks_used: ["Pandas", "smtplib"],
            technologies_used: null,
        },
    ],

    education: [
        {
            id: "76799857-2296-4852-8f98-817cfd10c50a",
            gpa: "3.93",
            awards: ["Dean's List 2022 - 2025"],
            degree: "BA + MS",
            majors: ["Computer Science"],
            minors: [],
            courses: [
                {
                    id: "7516aef9-92a6-4bbf-aacf-55f0f9ce3b90",
                    name: "CS 654",
                    grade: "A",
                    description: "Embedded programming",
                },
                {
                    id: "6fdcaa39-a25d-4a5d-bef0-2901ce303df4",
                    name: "CS 506",
                    grade: "A",
                    description: "Data science application",
                },
                {
                    id: "a101b37a-0965-466c-b21e-be97fdeb5aab",
                    name: "CS 599 X1",
                    grade: "A",
                    description: "AI agent programming",
                },
                {
                    id: "719e13b0-8a66-4e06-b374-b73ba910dada",
                    name: "CS 611",
                    grade: "A",
                    description: "OOP applications",
                },
                {
                    id: "9ed42873-c837-4c98-bd21-5b066538ce72",
                    name: "CS 132",
                    grade: "A",
                    description: "Linear Algebra",
                },
                {
                    id: "4c797477-9f5f-46d1-a308-44e4891768b0",
                    name: "CS 210",
                    grade: "A",
                    description: "Computer Systems",
                },
                {
                    id: "962db33f-da5d-4962-8f62-f7b573a81d72",
                    name: "CS 237",
                    grade: "A",
                    description: "Probability in computing",
                },
                {
                    id: "e45caa67-6f28-40b2-a5b7-ef3e9dfcbc2f",
                    name: "CS 330",
                    grade: "A",
                    description: "Algorithm design",
                },
                {
                    id: "113df929-2bfd-4747-ba26-02c8ce0a0f2b",
                    name: "CS 350",
                    grade: "A",
                    description: "Distributed systems",
                },
                {
                    id: "54cc554d-6064-4181-b747-938920b1fefc",
                    name: "CS 391",
                    grade: "A",
                    description: "React.js and Next.js",
                },
                {
                    id: "7d5667d8-e245-4bd5-888c-b0a7c5b2ecb1",
                    name: "CS 392",
                    grade: "A",
                    description: "Advanced algorithms",
                },
                {
                    id: "d0994627-8c69-4ff2-a38e-809780ec3e14",
                    name: "CS 392 P2",
                    grade: "A",
                    description: "Advanced algorithms 2",
                },
                {
                    id: "6b9590c0-2379-4bf7-8015-f3de3215497e",
                    name: "CS 410",
                    grade: "A",
                    description: "Systems programming",
                },
                {
                    id: "97ea526b-d524-4708-97ff-7984ee88276d",
                    name: "CS 440",
                    grade: "A",
                    description: "AI agent programming",
                },
                {
                    id: "4d30008f-cd07-4e82-845f-56e9cdfd112b",
                    name: "CS 460",
                    grade: "A",
                    description: "Databases",
                },
                {
                    id: "fceab06f-f855-4389-81cd-4cc86349551c",
                    name: "CS 501 E1",
                    grade: "A",
                    description: "Mobile development",
                },
                {
                    id: "9136d1ef-d45a-4f89-aff0-30437bf9fa76",
                    name: "CS 501 S1",
                    grade: "A",
                    description: ".NET programming",
                },
                {
                    id: "7065817b-8d9b-431f-8641-e212bcd92966",
                    name: "CS 131",
                    grade: "A-",
                    description: "Discrete math + combinatorics",
                },
                {
                    id: "f78b0b03-c428-4a27-b58f-d9ac23690064",
                    name: "CS 112",
                    grade: "A-",
                    description: "Data structures + algorithms",
                },
                {
                    id: "44e5f06f-a8ac-46ec-a488-17db12bc3e14",
                    name: "CS 320",
                    grade: "A-",
                    description: "Compiler design",
                },
            ],
            year_end: 2026,
            year_start: 2022,
            institution: "Boston University",
        },
        {
            id: "27455e1d-0065-48b7-b7cb-d7e061c9734a",
            gpa: "3.8",
            awards: ["High honors"],
            degree: "High School",
            majors: [],
            minors: [],
            courses: [],
            year_end: 2022,
            year_start: 2018,
            institution: "MICDS",
        },
    ],

    github_url: "https://github.com/EricNohara",
    resume_url:
        "https://jfsetifsqcpkwdtcrhdt.supabase.co/storage/v1/object/public/resumes/d206d86e-88d3-4f9d-986c-40352f4e952f-Eric%20Resume.pdf",

    experiences: [
        {
            id: "f310f6c0-23a8-421d-ab5e-eff707c62801",
            company: "Dot Foods",
            date_end: null,
            job_title: "Robotic Process Automation Developer",
            date_start: "2025-09-01",
            job_description:
                "Developed and deployed automation solutions using UiPath, VB.NET, and .NET to streamline workflows across departments and partner companies. Automated virtual tasks to improve efficiency and reduce manual effort of consumers. Collaborated closely with business teams to identify automation opportunities and ensure reliable, maintainable solutions. Assisted in updating legacy processes and providing QA to other team members.",
        },
        {
            id: "c3cda033-aef9-4dc3-864b-bad7b42cbd5f",
            company: "Dot Foods",
            date_end: "2025-08-20",
            job_title: "Software Engineer Intern",
            date_start: "2025-05-19",
            job_description:
                "Collaborated within an Agile team environment, participating in daily standups and iterative development cycles. Developed and maintained backend applications using C#, .NET, and Azure Function Apps. Wrote and optimized SQL queries for Microsoft SQL Server databases. Contributed to the team’s DevOps culture by building a Grafana dashboard to visualize DORA metrics and support data-driven decision-making.",
        },
        {
            id: "1b853bb4-259c-4ba8-8811-94f28902ac78",
            company: "Boston University",
            date_end: "2025-05-10",
            job_title: "CS 237 Course Assistant",
            date_start: "2024-01-10",
            job_description:
                "Assisted in facilitating the Spring 2024 CS 237 Course (Probability in Computing). Attended instructor meetings, addressed student inquiries, held office hours, formulated problem set solutions, and diligently contributed to grading.",
        },
        {
            id: "a9ae6585-05aa-4620-97e3-9c97c8cd5d1c",
            company: "Kappa Theta Pi Fraternity",
            date_end: null,
            job_title: "Website Coordinator Leader",
            date_start: "2023-09-01",
            job_description:
                "Lead team of developers to build and maintain the Kappa Theta Pi official website utilizing React.js to create an efficient website design with all necessary information about the organization.",
        },
    ],

    facebook_url: null,
    linkedin_url: "https://www.linkedin.com/in/eric-nohara-leclair-189298291/",
    phone_number: "6363179533",
    portrait_url:
        "https://jfsetifsqcpkwdtcrhdt.supabase.co/storage/v1/object/public/portraits/d206d86e-88d3-4f9d-986c-40352f4e952f-professional-headshot.jpg",
    instagram_url: "https://www.instagram.com/eric.nohara/",
    transcript_url:
        "https://jfsetifsqcpkwdtcrhdt.supabase.co/storage/v1/object/public/transcripts/d206d86e-88d3-4f9d-986c-40352f4e952f-Unofficial%20Transcript.pdf",
    current_address: "75 Sandy Ridge Court",
    current_company: "Dot Foods",
    current_position: "Software developer",
};

const educationIds = undefined;

const courseIds = [
    "7516aef9-92a6-4bbf-aacf-55f0f9ce3b90",
    "54cc554d-6064-4181-b747-938920b1fefc",
    "97ea526b-d524-4708-97ff-7984ee88276d",
    "4c797477-9f5f-46d1-a308-44e4891768b0",
    "7065817b-8d9b-431f-8641-e212bcd92966",
    "6fdcaa39-a25d-4a5d-bef0-2901ce303df4",
    "113df929-2bfd-4747-ba26-02c8ce0a0f2b",
    "f78b0b03-c428-4a27-b58f-d9ac23690064",
];

const experienceIds = [
    "f310f6c0-23a8-421d-ab5e-eff707c62801",
    "1b853bb4-259c-4ba8-8811-94f28902ac78",
];

const projectIds = [
    "7336ee41-e866-48dc-bb3a-57e93804fd93",
    "5c8d81c4-bf55-4429-9b3e-e9a4bc1693d8",
];

const skillIds = [
    "6a308865-8d81-410b-a7e3-838ddd414d79",
    "4b106ca4-9657-43dd-8dff-a1e8ec9c092e",
    "d53988c4-42d1-4833-af66-6e9cb6ebe37b",
    "fa9932f6-b145-4b7d-ba04-8600cbd960de",
    "a4351173-5075-4acf-810e-713c346c5b72",
    "97340c09-72e0-4451-bcc6-f47a24b096dd",
    "ed6244d7-14ee-45d0-85c7-50c829eb2e33",
    "556c4d0c-4cad-4c14-9d1b-8aaf25a278a7",
];

// normalize
const userInfo = cleanUserInfo(mockUserInfo, educationIds, courseIds, experienceIds, projectIds, skillIds);

// render HTML
const html =
    "<!DOCTYPE html>" +
    renderToStaticMarkup(<DefaultResumeTemplate userInfo={userInfo} />);

// write file
const filePath = path.join(process.cwd(), "preview.html");
fs.writeFileSync(filePath, html);

console.log("Preview generated at:", filePath);