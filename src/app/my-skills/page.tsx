"use client"

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
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
type HoverState = { direction: Direction; isHovering: boolean };
const modalEase: [number, number, number, number] = [0.22, 1, 0.36, 1];
const badgeFallback = "bg-gray-200 text-gray-800";

export default function MySkillsPage() {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  // Keep direction and hover phase separate for each tile.
  const [hoverState, setHoverState] = useState<Record<number, HoverState>>(
    () =>
      skillCategories.reduce((acc, _, idx) => {
        acc[idx] = { direction: "top", isHovering: false };
        return acc;
      }, {} as Record<number, HoverState>)
  );
  const rafIdsRef = useRef<Record<number, number>>({});

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

  const getOffscreenTransform = (dir: Direction): string => {
    if (dir === "left") return "translate3d(-100%, 0, 0)";
    if (dir === "right") return "translate3d(100%, 0, 0)";
    if (dir === "top") return "translate3d(0, -100%, 0)";
    return "translate3d(0, 100%, 0)";
  };

  const cancelRaf = (i: number) => {
    const rafId = rafIdsRef.current[i];
    if (rafId) {
      cancelAnimationFrame(rafId);
      delete rafIdsRef.current[i];
    }
  };

  const handleMouseEnter = (i: number, e: React.MouseEvent<HTMLDivElement>) => {
    const dir = getDirection(e);

    // Step 1: place overlay outside from enter edge.
    cancelRaf(i);
    setHoverState(prev => ({
      ...prev,
      [i]: { direction: dir, isHovering: false },
    }));

    // Step 2: in next frame, animate into center.
    rafIdsRef.current[i] = requestAnimationFrame(() => {
      setHoverState(prev => ({
        ...prev,
        [i]: { direction: dir, isHovering: true },
      }));
      delete rafIdsRef.current[i];
    });
  };

  const handleMouseLeave = (i: number, e: React.MouseEvent<HTMLDivElement>) => {
    const dir = getDirection(e);
    cancelRaf(i);
    setHoverState(prev => ({
      ...prev,
      [i]: { direction: dir, isHovering: false },
    }));
  };

  useEffect(() => {
    return () => {
      Object.values(rafIdsRef.current).forEach((rafId) => cancelAnimationFrame(rafId));
      rafIdsRef.current = {};
    };
  }, []);

  return (
    <div className="w-screen h-screen flex flex-wrap text-black overflow-hidden">
      {skillCategories.map((skill_cate, i) => {
        const state = hoverState[i];
        const transform = state?.isHovering
          ? "translate3d(0, 0, 0)"
          : getOffscreenTransform(state?.direction ?? "top");

        return (
          <div
            key={skill_cate.category}
            className="w-[50vw] h-[33vh] relative overflow-hidden bg-transparent"
            onMouseEnter={(e) => handleMouseEnter(i, e)}
            onMouseLeave={(e) => handleMouseLeave(i, e)}
            onClick={() => setSelectedCategory(skill_cate)}
          >
            {/* Gradient overlay enters/leaves from the detected edge. */}
            <div
              className="absolute inset-0 z-0 will-change-transform"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                transform,
                transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
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

      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            className="fixed inset-0 z-45 flex items-center justify-center bg-slate-950/60 px-4 py-6 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: modalEase }}
            onClick={() => {
              setSelectedSkill(null);
              setSelectedCategory(null);
            }}
          >
            <motion.div
              className="relative w-full max-w-6xl max-h-[80vh] overflow-hidden rounded-3xl border border-cyan-100/70 bg-white/95 shadow-[0_24px_100px_-36px_rgba(15,23,42,0.7)]"
              initial={{ opacity: 0, y: 26, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.32, ease: modalEase }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-2 w-full bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500" />
              <div className="max-h-[calc(80vh-8px)] overflow-y-auto p-5 md:p-7">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Skill Category</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">{selectedCategory.category}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSkill(null);
                      setSelectedCategory(null);
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
                    aria-label="Close category modal"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedCategory.items.map((item, idx) => (
                    <motion.button
                      key={`${item.title}-${idx}`}
                      type="button"
                      onClick={() => setSelectedSkill(item)}
                      className="group relative min-h-44 overflow-hidden rounded-2xl border border-sky-100 bg-linear-to-br from-sky-50 to-cyan-50 p-5 text-left shadow-[0_14px_30px_-22px_rgba(14,116,144,0.75)]"
                      whileHover={{ y: -6, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    >
                      <div className="pointer-events-none absolute -right-14 -top-10 h-28 w-28 rounded-full bg-cyan-200/55 blur-sm transition group-hover:bg-cyan-300/60" />
                      <h3 className="relative pr-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                      <p className="relative mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                      <div
                        className={`absolute bottom-4 right-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${levelColors[item.level.toLowerCase()] || badgeFallback} bg-opacity-80`}
                      >
                        {item.level}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: modalEase }}
            onClick={() => setSelectedSkill(null)}
          >
            <motion.div
              className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-blue-100/80 bg-white shadow-[0_28px_80px_-30px_rgba(15,23,42,0.75)]"
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.3, ease: modalEase }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400" />
              <div className="relative p-6 md:p-7">
                <button
                  type="button"
                  onClick={() => setSelectedSkill(null)}
                  className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
                  aria-label="Close skill detail modal"
                >
                  ✕
                </button>
                <h2 className="pr-10 text-2xl font-bold text-slate-900">{selectedSkill.title}</h2>
                <div
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${levelColors[selectedSkill.level.toLowerCase()] || badgeFallback} bg-opacity-80`}
                >
                  {selectedSkill.level}
                </div>
                <p className="mt-5 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                  {selectedSkill.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
