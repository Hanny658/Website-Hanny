"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Define project type
type Project = {
    title: string;
    image: string; // path relative to /public/portfolio/
    link: string | "this" | "private";
    description: string;
    icon: string; // Bootstrap icon classname
};

// portfolio defines
const projects: Project[] = [
    {
        title: "This Website",
        image: "/portfolio/hannysite.jpg",
        link: "this",
        description: "Of course, this comes first. Built by myself, for myself — a personal corner in the endless flow of modern data streams. After all, who could resist having their own space in this digital current?",
        icon: "bi bi-postcard",
    },
    {
        title: "1Club Membership",
        image: "/portfolio/1club.jpg",
        link: "https://1club.world",
        description: "Project done at work with only myself, for the company's upcoming event. Exclusive private membership platform with perks and rewards. Build with React + Vite (migrated from CRA) with React Bootstrap empowered.",
        icon: "bi bi-people-fill",
    },
    {
        title: "Snack Map",
        image: "/portfolio/snackmap.jpg",
        link: "https://snackmap.org",
        description: "My personal project, initiated as people called me 'the King of Snacks', so I want to share my information about affordable snacks around me, as well as letting people like me to share their favorite deals. Built with Next.js + Prisma + PostgreSQL (Redis in progress).",
        icon: "bi bi-map",
    },
    {
        title: "Roseneath Park Website",
        image: "/portfolio/rhp.jpg",
        link: "https://roseneathholidaypark.au/",
        description: "Official website for a holiday park developed within a team, using React + Tailwind + vanilla CSS for frontend and I hosted it on the company's cloud server with Nginx.",
        icon: "bi bi-houses",
    },
    {
        title: "Number Game - The King of Diamonds",
        image: "/portfolio/kod.jpg",
        link: "https://minigame.hanny.vip",
        description: "A beauty-contest-like survival game inspired by the King of Diamonds challenge from Alice in Borderland (今際の国のアリス) S2. With small twists and various bot player characteristics. Used original OST as BGM.",
        icon: "bi bi-joystick",
    },
    {
        title: "Bitrain Matrixx",
        image: "/portfolio/matrixx.png",
        link: "https://www.npmjs.com/package/bitrain-matrixx?activeTab=readme",
        description: "Songbook website for the caregroup. If you also wish to join the church family and sing with us, reach out to us at Melbounre uni every week on Sabbath! Built with Next.js + LowDB.",
        icon: "bi bi-typescript",
    },
    {
        title: "Coupon & Membership Management System",
        image: "/portfolio/dcs.jpg",
        link: "private",
        description: "A QR Code based digital coupon redeeming and membership recognising system build by me (no others~) with React + Node.js Express. Providing Restful APIs for coupon creation and usage alone with all history records in client-side portal.",
        icon: "bi bi-ticket-perforated",
    },
    {
        title: "Mailing Service",
        image: "/portfolio/mail.jpg",
        link: "private",
        description: "This is a Node.js Express app using nodemailer to handle email-related requests for the company (developed mostly by myself). Which including sending formatted emails and for quick subscriptions to MailChimp. Well documented.",
        icon: "bi bi-envelope-check",
    },
    {
        title: "Chatbot Knowledge Management Sys",
        image: "/portfolio/chatbot.jpg",
        link: "https://github.com/Hanny658/RAG-with-Chroma",
        description: "This is a RAG app build from scratch (without LangChain, even tho I know it's so good) with Chroma DB and text-embeddings with OpenAI APIs. The link down here is a PROTOTYPE I built that allows others to add customised function calling or context management on it. Frontend built with React.",
        icon: "bi bi-inboxes",
    },
    {
        title: "CG Songbook - Lyrics and Chords",
        image: "/portfolio/cgsb.jpg",
        link: "https://cgsongbook.org",
        description: "Songbook website for the caregroup. If you also wish to join the church family and sing with us or have a bit of curious about who Jesus really is, reach out to us at Melbounrne Uni every week on Sabbath! Built with Next.js + LowDB.",
        icon: "bi bi-music-note-list",
    },
];

export default function PersonalPortfolioPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="relative flex items-center justify-center my-10">
                <div className="absolute -z-10 w-64 h-64 rounded-full bg-sky-300/30 blur-3xl" />
                <svg
                    className="absolute -z-10 w-56 h-56 opacity-80 animate-pulse"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                >
                    <defs>
                        <radialGradient id="starGlow" cx="50%" cy="50%" r="60%">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <g filter="url(#blur)">
                        <polygon
                            points="50,8 60,37 90,37 65,55 74,84 50,67 26,84 35,55 10,37 40,37"
                            fill="url(#starGlow)"
                        />
                    </g>
                    <polygon
                        points="50,8 60,37 90,37 65,55 74,84 50,67 26,84 35,55 10,37 40,37"
                        fill="url(#starGlow)"
                    />
                    <filter id="blur">
                        <feGaussianBlur stdDeviation="3" />
                    </filter>
                </svg>

                {/* Your heading */}
                <h1 className="text-4xl font-bold text-center mb-10 font-title drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]">
                    Personal Project Collection
                </h1>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, idx) => (
                    <motion.div
                        key={project.title}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.2, duration: 0.6, ease: "easeOut" }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition flex flex-col"
                    >
                        {/* Image */}
                        <div className="relative h-60 w-full">
                            <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                className="object-cover shadow-xs"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col justify-between flex-1">
                            <div>
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <i className={project.icon}></i> {project.title}
                                </h2>
                                <p className="text-gray-600 mt-3">{project.description}</p>
                            </div>

                            {project.link == "this" ?
                                <p className="mt-4 inline-block !text-sky-600 !text-right font-medium self-end">
                                    You are currently viewing ~
                                </p>
                                : (
                                    project.link == "private" ?
                                        <p className="mt-4 inline-block !text-sky-600 !text-right font-medium self-end">
                                            This is an internal / private system
                                        </p>
                                        :
                                        <Link
                                            href={project.link}
                                            target="_blank"
                                            className="mt-4 inline-block !text-sky-500 hover:text-sky-600 !text-right font-medium hover:underline self-end"
                                        >
                                            Visit Page →
                                        </Link>
                                    )
                                }
                        </div>
                    </motion.div>
                ))}
                <motion.div
                        key='more'
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: projects.length * 0.2, duration: 0.6, ease: "easeOut" }}
                        className="bg-transparent overflow-hidden transition flex flex-col justify-center"
                    >
                        <h1 className="text-center text-4xl font-art">More Coming ...</h1>
                </motion.div>
            </div>
        </div>
    );
}
