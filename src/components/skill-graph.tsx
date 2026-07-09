"use client";

import { useEffect, useRef } from "react";
import { graphNodes, graphLinks } from "src/lib/skill-graph-data";

interface SkillGraphProps {
  onSelectSkillId: (id: string) => void;
  onSelectCategory: (name: string) => void;
  /** Disable glow / motion for low-power or reduced-motion contexts. */
  lite?: boolean;
}

const levelVal: Record<string, number> = {
  beginner: 1.5,
  intermediate: 3,
  proficient: 6,
  expert: 10,
};

export default function SkillGraph({ onSelectSkillId, onSelectCategory, lite = false }: SkillGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);

  useEffect(() => {
    let disposed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resizeObserver: ResizeObserver | null = null;

    (async () => {
      // Dynamic import keeps three.js / WebGL out of the SSR pass.
      const [{ default: ForceGraph3D }, { default: SpriteText }, THREE] = await Promise.all([
        import("3d-force-graph"),
        import("three-spritetext"),
        import("three"),
      ]);
      if (disposed || !containerRef.current) return;

      const el = containerRef.current;

      // Clone so the library can mutate freely; pin every node to its PCA
      // coordinate (fx/fy/fz) so the layout stays faithful to the embedding.
      const nodes = graphNodes.map((n) => ({ ...n, fx: n.x, fy: n.y, fz: n.z }));
      const links = graphLinks.map((l) => ({ ...l }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodeColor = (n: any): string => n.color ?? "#64748b";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const linkSourceColor = (l: any): string =>
        typeof l.source === "object" && l.source?.color ? l.source.color : "#38bdf8";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Graph: any = new ForceGraph3D(el, {
        rendererConfig: { alpha: true, antialias: true },
        controlType: "orbit",
      });
      Graph
        .backgroundColor("rgba(0,0,0,0)")
        .showNavInfo(false)
        .enableNodeDrag(false)
        .graphData({ nodes, links })
        .nodeId("id")
        .nodeRelSize(4)
        .nodeResolution(16)
        .nodeOpacity(0.92)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .nodeVal((n: any) => (n.isHub ? 14 : levelVal[n.level as string] ?? 3))
        .nodeColor(nodeColor)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .nodeLabel((n: any) =>
          n.isHub
            ? ""
            : `<div style="padding:6px 10px;border-radius:8px;background:rgba(2,6,23,0.92);border:1px solid ${nodeColor(
                n
              )};color:#e2e8f0;font-size:12px;font-family:system-ui,sans-serif;white-space:nowrap">
                 <strong style="color:${nodeColor(n)}">${n.id}</strong>
                 <span style="opacity:.7"> · ${n.level ?? ""}</span>
               </div>`
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .nodeThreeObjectExtend((n: any) => !n.isHub)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .nodeThreeObject((n: any) => {
          if (n.isHub) {
            const group = new THREE.Group();
            const halo = new THREE.Mesh(
              new THREE.SphereGeometry(5.5, 20, 20),
              new THREE.MeshBasicMaterial({ color: n.color, transparent: true, opacity: 0.16 })
            );
            group.add(halo);
            const label = new SpriteText(String(n.category).toUpperCase());
            label.color = n.color;
            label.textHeight = 5;
            label.fontWeight = "700";
            label.strokeColor = "rgba(2,6,23,0.9)";
            label.strokeWidth = 0.6;
            label.position.set(0, 11, 0);
            group.add(label);
            return group;
          }
          // Always-on labels for expert skills only (avoids 51-label clutter).
          if (n.level === "expert") {
            const label = new SpriteText(n.id);
            label.color = "#dbeafe";
            label.textHeight = 2.6;
            label.strokeColor = "rgba(2,6,23,0.9)";
            label.strokeWidth = 0.5;
            label.position.set(0, 5.5, 0);
            return label;
          }
          return undefined;
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .linkColor((l: any) => (l.kind === "member" ? "#334155" : linkSourceColor(l)))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .linkWidth((l: any) => (l.kind === "member" ? 0.2 : 0.6))
        .linkOpacity(lite ? 0.35 : 0.45)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .linkDirectionalParticles((l: any) => (lite || l.kind === "member" ? 0 : 2))
        .linkDirectionalParticleWidth(1.1)
        .linkDirectionalParticleSpeed(0.005)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .onNodeClick((n: any) => {
          if (n.isHub) onSelectCategory(n.category);
          else onSelectSkillId(n.id);
        })
        .warmupTicks(0)
        .cooldownTicks(0);

      graphRef.current = Graph;

      // View-independent lighting: soft ambient + hemisphere, no directional
      // hotspot — so orbiting to the top no longer "flash-bangs".
      Graph.lights([
        new THREE.AmbientLight(0xffffff, 1.5),
        new THREE.HemisphereLight(0xcfe3ff, 0x0a0e16, 0.9),
      ]);

      // Bloom glow (best-effort — skipped in lite mode or if the pass fails).
      // Gentler than before (lower strength, higher threshold) so aligned
      // clusters glow without blowing out.
      if (!lite) {
        try {
          const { UnrealBloomPass } = await import(
            "three/examples/jsm/postprocessing/UnrealBloomPass.js"
          );
          const bloom = new UnrealBloomPass(
            new THREE.Vector2(el.clientWidth, el.clientHeight),
            0.65,
            0.5,
            0.25
          );
          Graph.postProcessingComposer().addPass(bloom);
        } catch {
          /* bloom is optional */
        }
      }

      // Gentle idle auto-rotation (orbit controls pause it during interaction).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const controls = Graph.controls() as any;
      if (controls && !lite) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.55;
      }

      Graph.cameraPosition({ x: 0, y: 10, z: 240 });
      window.setTimeout(() => {
        if (!disposed) Graph.zoomToFit(1200, 60);
      }, 450);

      const resize = () => {
        if (!containerRef.current) return;
        Graph.width(containerRef.current.clientWidth).height(containerRef.current.clientHeight);
      };
      resize();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(el);
    })();

    return () => {
      disposed = true;
      if (resizeObserver) resizeObserver.disconnect();
      if (graphRef.current) {
        try {
          graphRef.current._destructor();
        } catch {
          /* already torn down */
        }
        graphRef.current = null;
      }
    };
  }, [lite, onSelectCategory, onSelectSkillId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
