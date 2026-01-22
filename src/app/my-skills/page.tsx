"use client"

import React, { useState } from "react";
import Image from "next/image";
import skillData from "../../skilldata.json";

interface SkillItem {
  title: string;
  level: string;
  description: string;
}

interface SkillCategory {
  category: string;
  icon: string;
  items: SkillItem[];
}

const levelColors: Record<string, string> = {
  beginner: "bg-blue-200 text-blue-800",
  intermediate: "bg-yellow-200 text-yellow-800",
  proficient: "bg-green-200 text-green-800",
  expert: "bg-purple-200 text-purple-800",
};

const skillCategories = skillData.skills;

type Direction = "left" | "right" | "top" | "bottom";

export default function MySkillsPage() {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  // 1. Initialize every panel to start with "top"
  const [hoverDirection, setHoverDirection] = useState<Record<number, Direction>>(
    () =>
      skillCategories.reduce((acc, _, idx) => {
        acc[idx] = "top";
        return acc;
      }, {} as Record<number, Direction>)
  );

  // 2. Detect which edge the mouse came/leaves from
  const getDirection = (e: React.MouseEvent<HTMLDivElement>): Direction => {
    const el = e.currentTarget;                 // always the DIV
    const { top, left, width, height } = el.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const distances: Record<Direction, number> = {
      top:    y,
      bottom: height - y,
      left:   x,
      right:  width - x,
    };

    // find the smallest distance
    return (["top", "bottom", "left", "right"] as Direction[]).reduce(
      (closest, dir) =>
        distances[dir] < distances[closest] ? dir : closest,
      "top"
    );
  };

  const handleMouseEnter = (i: number, e: React.MouseEvent<HTMLDivElement>) => {
    const dir = getDirection(e);
    setHoverDirection(prev => ({ ...prev, [i]: dir }));
  };

  const handleMouseLeave = (i: number, e: React.MouseEvent<HTMLDivElement>) => {
    const dir = getDirection(e);
    setHoverDirection(prev => ({ ...prev, [i]: dir }));
  };

  return (
    <div className="w-screen h-screen flex flex-wrap text-black overflow-hidden">
      {skillCategories.map((skill_cate, i) => {
        const dir = hoverDirection[i];

        return (
          <div
            key={skill_cate.category}
            className="w-[50vw] h-[33vh] relative group overflow-hidden bg-transparent"
            onMouseEnter={(e) => handleMouseEnter(i, e)}
            onMouseLeave={(e) => handleMouseLeave(i, e)}
            onClick={() => setSelectedCategory(skill_cate)}
          >
            {/* Gradient overlay: initial transform based on dir="top" */}
            <div
              className={`
                absolute inset-0 z-0 transition-transform duration-700
                ${dir === "left"   ? "-translate-x-full group-hover:translate-x-0"   : ""}
                ${dir === "right"  ? " translate-x-full group-hover:translate-x-0"   : ""}
                ${dir === "top"    ? "-translate-y-full group-hover:translate-y-0"   : ""}
                ${dir === "bottom" ? " translate-y-full group-hover:translate-y-0"   : ""}
              `}
              style={{
                background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
              }}
            />

            {/* Icon + title */}
            <div className="relative flex flex-col items-center justify-center w-full h-full bg-transparent">
              <Image
                src={`/icons/${skill_cate.icon}`}
                alt={skill_cate.category}
                width={100}
                height={100}
                className="w-24 h-24 mb-3"
              />
              <div className="text-lg z-10 text-white font-semibold mix-blend-difference">
                {skill_cate.category}
              </div>
            </div>
          </div>
        );
      })}

      {/* Category Modal */}
      {selectedCategory && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-45 min-h-2/3"
          onClick={() => setSelectedCategory(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-[80vw] max-h-[80vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedCategory.category}</h2>
              <button onClick={() => setSelectedCategory(null)} className="text-xl">✕</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedCategory.items.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSkill(item)}
                  className="bg-sky-100 hover:bg-sky-200 rounded-xl p-4 cursor-pointer shadow hover:shadow-md relative"
                >
                  <h3 className="text-center font-medium text-lg mb-2">{item.title}</h3>
                  <br></br>
                  <div className={`absolute bottom-2 right-2 text-sm px-2 py-1 rounded ${levelColors[item.level.toLowerCase()] || 'bg-gray-200 text-gray-800'} bg-opacity-70`}>
                    {item.level}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedSkill(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-[90vw] max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedSkill.title}</h2>
              <button onClick={() => setSelectedSkill(null)} className="text-lg">✕</button>
            </div>
            <p className="mb-4 text-gray-700 whitespace-pre-wrap">{selectedSkill.description}</p>
            <div className={`text-sm px-3 py-1 rounded absolute bottom-4 right-4 ${levelColors[selectedSkill.level.toLowerCase()] || 'bg-gray-200 text-gray-800'} bg-opacity-70`}>
              {selectedSkill.level}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
