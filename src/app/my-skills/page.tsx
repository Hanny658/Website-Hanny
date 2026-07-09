"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  skillCategories,
  categoryByName,
  categoryMeta,
  graphNodes,
  type SkillCategory,
  type SkillItem,
} from "src/lib/skill-graph-data";
import SkillGrid from "src/components/skill-grid";

const SkillGraph = dynamic(() => import("src/components/skill-graph"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-300">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/40 border-t-cyan-300" />
        <span className="text-sm tracking-wide">Mapping the constellation…</span>
      </div>
    </div>
  ),
});

const levelColors: Record<string, string> = {
  beginner: "bg-blue-200 text-blue-800",
  intermediate: "bg-yellow-200 text-yellow-800",
  proficient: "bg-green-200 text-green-800",
  expert: "bg-purple-200 text-purple-800",
};
const badgeFallback = "bg-gray-200 text-gray-800";
const modalEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

type View = "graph" | "grid";

export default function MySkillsPage() {
  const [view, setView] = useState<View>("graph");
  const [lite, setLite] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  // Default to the grid on small screens / reduced-motion; keep the graph lite.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 768px)").matches;
    if (reduce || small) {
      setView("grid");
      setLite(true);
    }
  }, []);

  const handleSkillId = (id: string) => {
    const node = graphNodes.find((n) => n.id === id);
    if (node) {
      setSelectedSkill({
        title: node.id,
        level: node.level ?? "intermediate",
        description: node.description ?? "",
      });
    }
  };

  const handleCategoryName = (name: string) => {
    const cat = categoryByName(name);
    if (cat) setSelectedCategory(cat);
  };

  const closeAll = () => {
    setSelectedSkill(null);
    setSelectedCategory(null);
  };

  const accent = selectedCategory
    ? categoryMeta.find((c) => c.name === selectedCategory.category)?.color ?? "#06b6d4"
    : "#06b6d4";

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-linear-to-b from-slate-900 via-slate-950 to-black">
      {/* ambient accents to echo the home page */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.14),transparent_42%),radial-gradient(circle_at_78%_30%,rgba(139,92,246,0.12),transparent_40%),radial-gradient(circle_at_55%_88%,rgba(236,72,153,0.10),transparent_45%)]" />

      {/* View toggle (top-right, under the navbar) */}
      <div className="absolute right-4 top-20 z-40 flex items-center rounded-full border border-white/10 bg-slate-900/70 p-1 backdrop-blur">
        {(
          [
            { key: "graph", label: "Graph", icon: "bi-diagram-3" },
            { key: "grid", label: "Grid", icon: "bi-grid-3x2-gap" },
          ] as { key: View; label: string; icon: string }[]
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setView(opt.key)}
            aria-pressed={view === opt.key}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              view === opt.key
                ? "bg-cyan-400/90 text-slate-900 shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <i className={`bi ${opt.icon}`} aria-hidden="true" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Heading */}
      <div className="pointer-events-none absolute left-1/2 top-18 z-30 -translate-x-1/2 text-center">
        <h1 className="font-title text-2xl font-bold text-white drop-shadow-[0_0_12px_rgba(56,189,248,0.5)] md:text-3xl">
          My Skills
        </h1>
      </div>

      {/* Views */}
      <div className="absolute inset-0">
        {view === "graph" ? (
          <SkillGraph
            onSelectSkillId={handleSkillId}
            onSelectCategory={handleCategoryName}
            lite={lite}
          />
        ) : (
          <div className="h-full w-full pt-28">
            <SkillGrid categories={skillCategories} onSelectCategory={setSelectedCategory} />
          </div>
        )}
      </div>

      {/* Legend + caption (graph only) */}
      {view === "graph" && (
        <div className="pointer-events-none absolute bottom-6 left-4 z-30 max-w-[70vw]">
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {categoryMeta.map((cat) => (
              <span key={cat.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}` }}
                />
                {cat.name}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Nodes positioned by semantic similarity · size = proficiency · drag to orbit, scroll to zoom
          </p>
        </div>
      )}

      {/* Category modal */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            className="fixed inset-0 z-45 flex items-center justify-center bg-slate-950/60 px-4 py-6 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: modalEase }}
            onClick={closeAll}
          >
            <motion.div
              className="relative max-h-[80vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white/95 shadow-[0_24px_100px_-36px_rgba(15,23,42,0.7)]"
              initial={{ opacity: 0, y: 26, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.32, ease: modalEase }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${accent}, #06b6d4)` }} />
              <div className="max-h-[calc(80vh-8px)] overflow-y-auto p-5 md:p-7">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Skill Category</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">{selectedCategory.category}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeAll}
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
                      <p className="relative mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.description}</p>
                      <div
                        className={`absolute bottom-4 right-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          levelColors[item.level.toLowerCase()] || badgeFallback
                        } bg-opacity-80`}
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

      {/* Skill-detail modal */}
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
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    levelColors[selectedSkill.level.toLowerCase()] || badgeFallback
                  } bg-opacity-80`}
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
