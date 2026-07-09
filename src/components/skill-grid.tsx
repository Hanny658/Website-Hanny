"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { SkillCategory } from "src/lib/skill-graph-data";

type Direction = "left" | "right" | "top" | "bottom";
type HoverState = { direction: Direction; isHovering: boolean };

interface SkillGridProps {
  categories: SkillCategory[];
  onSelectCategory: (category: SkillCategory) => void;
}

export default function SkillGrid({ categories, onSelectCategory }: SkillGridProps) {
  const [hoverState, setHoverState] = useState<Record<number, HoverState>>(() =>
    categories.reduce((acc, _, idx) => {
      acc[idx] = { direction: "top", isHovering: false };
      return acc;
    }, {} as Record<number, HoverState>)
  );
  const rafIdsRef = useRef<Record<number, number>>({});

  // Detect which edge the mouse crossed.
  const getDirection = (e: React.MouseEvent<HTMLDivElement>): Direction => {
    const el = e.currentTarget;
    const { top, left, width, height } = el.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const distances: Record<Direction, number> = { top: y, bottom: height - y, left: x, right: width - x };
    return (["top", "bottom", "left", "right"] as Direction[]).reduce(
      (closest, dir) => (distances[dir] < distances[closest] ? dir : closest),
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
    cancelRaf(i);
    setHoverState((prev) => ({ ...prev, [i]: { direction: dir, isHovering: false } }));
    rafIdsRef.current[i] = requestAnimationFrame(() => {
      setHoverState((prev) => ({ ...prev, [i]: { direction: dir, isHovering: true } }));
      delete rafIdsRef.current[i];
    });
  };

  const handleMouseLeave = (i: number, e: React.MouseEvent<HTMLDivElement>) => {
    const dir = getDirection(e);
    cancelRaf(i);
    setHoverState((prev) => ({ ...prev, [i]: { direction: dir, isHovering: false } }));
  };

  useEffect(() => {
    const rafIds = rafIdsRef.current;
    return () => {
      Object.values(rafIds).forEach((rafId) => cancelAnimationFrame(rafId));
      rafIdsRef.current = {};
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-wrap text-black">
      {categories.map((skill_cate, i) => {
        const state = hoverState[i];
        const transform = state?.isHovering
          ? "translate3d(0, 0, 0)"
          : getOffscreenTransform(state?.direction ?? "top");

        return (
          <div
            key={skill_cate.category}
            className="relative h-1/3 w-1/2 cursor-pointer overflow-hidden bg-transparent"
            onMouseEnter={(e) => handleMouseEnter(i, e)}
            onMouseLeave={(e) => handleMouseLeave(i, e)}
            onClick={() => onSelectCategory(skill_cate)}
          >
            <div
              className="absolute inset-0 z-0 will-change-transform"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
                transform,
                transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
            <div className="relative flex h-full w-full flex-col items-center justify-center bg-transparent">
              <Image
                src={`/icons/${skill_cate.icon}`}
                alt={skill_cate.category}
                width={100}
                height={100}
                className="mb-3 h-24 w-24"
              />
              <div className="z-10 text-lg font-semibold text-white mix-blend-difference">
                {skill_cate.category}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
