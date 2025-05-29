"use client"

import React, { useState } from "react";
import Image from "next/image";

type Skill = {
  title: string;
  icon: string;
};

const skills: Skill[] = [
  { title: "Frontend", icon: "frontend.svg" },
  { title: "Backend", icon: "backend.svg" },
  { title: "DevOps & CI/CD", icon: "sync.svg" },
  { title: "AI & Data Science", icon: "ai.svg" },
  { title: "Software Skills", icon: "software.svg" },
  { title: "Other Skills", icon: "skills.svg" },
];

const directions = ["left", "right", "top", "bottom"] as const;
type Direction = typeof directions[number];

const MySkillsPage: React.FC = () => {
  const [hoverDirection, setHoverDirection] = useState<Record<number, Direction>>({});

  const getRandomDirection = (): Direction => {
    return directions[Math.floor(Math.random() * directions.length)];
  };

  const handleMouseEnter = (index: number) => {
    setHoverDirection((prev) => ({ ...prev, [index]: getRandomDirection() }));
  };

  const handleMouseLeave = (index: number) => {
    setHoverDirection((prev) => ({ ...prev, [index]: getRandomDirection() }));
  };

  return (
    <div className="w-screen h-screen flex flex-wrap overflow-hidden">
      {skills.map((skill, index) => {
        const dir = hoverDirection[index];

        return (
          <div
            key={skill.title}
            className="w-[50vw] h-[33vh] relative group overflow-hidden bg-transparent"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
          >
            {/* Animated gradient overlay */}
            <div
              className={`
                absolute inset-0 z-0 transition-transform duration-700
                ${dir === "left" ? "-translate-x-full group-hover:translate-x-0" : ""}
                ${dir === "right" ? "translate-x-full group-hover:translate-x-0" : ""}
                ${dir === "top" ? "-translate-y-full group-hover:translate-y-0" : ""}
                ${dir === "bottom" ? "translate-y-full group-hover:translate-y-0" : ""}
              `}
              style={{
                background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
              }}
            ></div>

            {/* Foreground content */}
            <div className="relative flex flex-col items-center justify-center w-full h-full bg-transparent">
              <Image
                src={`/icons/${skill.icon}`}
                alt={skill.title}
                width={100}
                height={100}
                className="w-24 h-24 mb-3"
              />
              <div className="text-lg z-10 text-white font-semibold mix-blend-difference">{skill.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MySkillsPage;
