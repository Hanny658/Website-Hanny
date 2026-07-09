/**
 * Offline skill-graph builder.
 *
 * Reads src/skilldata.json, turns every skill into a vector, projects the
 * vectors to 3D with PCA, and links semantically-close skills via cosine kNN.
 * The result is written to src/skillgraph.json, which the my-skills page reads
 * for BOTH the 3D graph and the grid view.
 *
 * Two vector sources:
 *   - OpenAI text-embedding-3-small  (when OPENAI_API_KEY is set) — real semantics.
 *   - Local char/word TF-IDF fallback (no key) — deterministic, offline, decent.
 *
 * OPENAI_API_KEY is read from the shell, or from .env.local / .env at the repo
 * root (shell wins; .env.local wins over .env).
 *
 * Run:  npm run embed-skills
 * (re-run whenever src/skilldata.json changes, then commit src/skillgraph.json)
 */

import fs from "node:fs";
import path from "node:path";

// ---------- types ----------

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
interface SkillData {
  skills: SkillCategory[];
}

interface GraphNode {
  id: string;
  category: string;
  color: string;
  isHub: boolean;
  x: number;
  y: number;
  z: number;
  level?: string;
  description?: string;
  icon?: string;
}
interface GraphLink {
  source: string;
  target: string;
  weight: number;
  kind: "semantic" | "member";
}

// ---------- config ----------

// Validated categorical palette (dataviz skill, dark surface). Base colors —
// the WebGL layer adds emissive glow on top. Keep in sync with the component.
const CATEGORY_COLORS: Record<string, string> = {
  Frontend: "#0891b2",
  Backend: "#059669",
  "DevOps & CI/CD": "#ea580c",
  "AI & Data Science": "#8b5cf6",
  "Software Skills": "#b7791f",
  "Other Skills": "#ec4899",
};
const FALLBACK_COLOR = "#64748b";

const EMBED_MODEL = "text-embedding-3-small";
const KNN_K = 3; // nearest semantic neighbours per skill
const SIM_FLOOR = 0.12; // drop links weaker than this
const COORD_SCALE = 22; // spatial spread of the whitened cloud
const MIN_NODE_DIST = 18; // enforced minimum spacing between skill nodes
const DECLUTTER_ITERS = 120; // relaxation passes for the min-distance spread

const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "src", "skilldata.json");
const OUT_PATH = path.join(ROOT, "src", "skillgraph.json");

/**
 * Load KEY=VALUE pairs from .env files into process.env (no dependency).
 * A value already set in the shell wins; among files, .env.local wins over
 * .env (matching Next.js precedence).
 */
function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p)) continue;
    for (const raw of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const line = raw.trim().replace(/^export\s+/, "");
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  }
}

// ---------- vector sources ----------

async function embedWithOpenAI(texts: string[]): Promise<number[][]> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.embeddings.create({ model: EMBED_MODEL, input: texts });
  return res.data.map((d) => d.embedding as number[]);
}

/** Deterministic offline fallback: word + char-trigram TF-IDF vectors. */
function tfidfVectors(texts: string[]): number[][] {
  const tokenize = (t: string): string[] => {
    const words = t.toLowerCase().match(/[a-z0-9+#.]+/g) ?? [];
    const grams: string[] = [];
    for (const w of words) {
      grams.push(`w:${w}`);
      const padded = `  ${w} `;
      for (let i = 0; i < padded.length - 2; i++) grams.push(`g:${padded.slice(i, i + 3)}`);
    }
    return grams;
  };

  const docTokens = texts.map(tokenize);
  const df = new Map<string, number>();
  for (const toks of docTokens) {
    for (const term of new Set(toks)) df.set(term, (df.get(term) ?? 0) + 1);
  }
  const vocab = [...df.keys()];
  const termIndex = new Map(vocab.map((term, i) => [term, i]));
  const n = texts.length;
  const idf = vocab.map((term) => Math.log((1 + n) / (1 + (df.get(term) ?? 0))) + 1);

  return docTokens.map((toks) => {
    const vec = new Array(vocab.length).fill(0);
    const tf = new Map<string, number>();
    for (const term of toks) tf.set(term, (tf.get(term) ?? 0) + 1);
    for (const [term, count] of tf) {
      const idx = termIndex.get(term)!;
      vec[idx] = count * idf[idx];
    }
    return vec;
  });
}

// ---------- linear algebra ----------

function l2normalize(vecs: number[][]): number[][] {
  return vecs.map((v) => {
    const norm = Math.hypot(...v) || 1;
    return v.map((x) => x / norm);
  });
}

/** Deterministic PRNG so layouts are reproducible across runs. */
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Top-3 principal-component scores via the Gram-matrix (N×N) trick, which is
 * cheap regardless of embedding dimensionality. For centered data Xc, the
 * score of point i on a PC equals sqrt(lambda) * u_i, where (lambda, u) is an
 * eigenpair of G = Xc·Xcᵀ. Solved by power iteration + deflation.
 */
function pca3(vecs: number[][]): [number, number, number][] {
  const n = vecs.length;
  const dim = vecs[0].length;

  // center columns
  const mean = new Array(dim).fill(0);
  for (const v of vecs) for (let j = 0; j < dim; j++) mean[j] += v[j] / n;
  const centered = vecs.map((v) => v.map((x, j) => x - mean[j]));

  // Gram matrix G = Xc · Xcᵀ  (n×n)
  const gram: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let k = i; k < n; k++) {
      let dot = 0;
      for (let j = 0; j < dim; j++) dot += centered[i][j] * centered[k][j];
      gram[i][k] = dot;
      gram[k][i] = dot;
    }
  }

  const rng = makeRng(12345);
  const matVec = (m: number[][], v: number[]): number[] =>
    m.map((row) => row.reduce((acc, val, j) => acc + val * v[j], 0));

  const comps: number[][] = [];
  const eigs: number[] = [];
  const work = gram.map((row) => [...row]);

  for (let c = 0; c < 3; c++) {
    let v = Array.from({ length: n }, () => rng() - 0.5);
    let norm = Math.hypot(...v) || 1;
    v = v.map((x) => x / norm);

    for (let iter = 0; iter < 300; iter++) {
      const w = matVec(work, v);
      norm = Math.hypot(...w);
      if (norm < 1e-9) break;
      v = w.map((x) => x / norm);
    }

    const gv = matVec(work, v);
    const lambda = v.reduce((acc, x, i) => acc + x * gv[i], 0);
    comps.push(v);
    eigs.push(Math.max(lambda, 0));

    // deflate: G := G - lambda · v·vᵀ
    for (let i = 0; i < n; i++)
      for (let k = 0; k < n; k++) work[i][k] -= lambda * v[i] * v[k];
  }

  // raw scores, then whiten each axis to unit std and scale to fill the cube
  const rawAxis = comps.map((v, c) => v.map((ui) => Math.sqrt(eigs[c]) * ui));
  const scaledAxis = rawAxis.map((scores) => {
    const m = scores.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(scores.reduce((a, b) => a + (b - m) ** 2, 0) / n) || 1;
    return scores.map((s) => ((s - m) / std) * COORD_SCALE);
  });

  return Array.from({ length: n }, (_, i) => [scaledAxis[0][i], scaledAxis[1][i], scaledAxis[2][i]]);
}

/**
 * Min-distance declutter. PCA can pile near-identical skills on top of each
 * other; this pushes apart only pairs closer than `minDist` (a short-range,
 * non-linear repulsion), leaving well-separated nodes untouched, then recenters.
 * Keeps the semantic layout while making dense clusters legible.
 */
function declutter(
  coords: [number, number, number][],
  minDist: number,
  iterations: number
): [number, number, number][] {
  const n = coords.length;
  const pts = coords.map((c) => [c[0], c[1], c[2]] as [number, number, number]);
  const rng = makeRng(777);

  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = pts[i][0] - pts[j][0];
        let dy = pts[i][1] - pts[j][1];
        let dz = pts[i][2] - pts[j][2];
        let d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < 1e-4) {
          // coincident — nudge in a deterministic random direction
          dx = rng() - 0.5;
          dy = rng() - 0.5;
          dz = rng() - 0.5;
          d = Math.hypot(dx, dy, dz) || 1e-4;
        }
        if (d < minDist) {
          const push = ((minDist - d) / d) * 0.5;
          pts[i][0] += dx * push;
          pts[i][1] += dy * push;
          pts[i][2] += dz * push;
          pts[j][0] -= dx * push;
          pts[j][1] -= dy * push;
          pts[j][2] -= dz * push;
        }
      }
    }
  }

  // recenter on the origin so the camera stays framed
  const mean = [0, 0, 0];
  for (const p of pts) for (let k = 0; k < 3; k++) mean[k] += p[k] / n;
  return pts.map((p) => [p[0] - mean[0], p[1] - mean[1], p[2] - mean[2]] as [number, number, number]);
}

// ---------- graph assembly ----------

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let j = 0; j < a.length; j++) dot += a[j] * b[j];
  return dot; // inputs are L2-normalized
}

function buildLinks(titles: string[], normed: number[][]): GraphLink[] {
  const n = titles.length;
  const seen = new Set<string>();
  const links: GraphLink[] = [];

  for (let i = 0; i < n; i++) {
    const sims = normed
      .map((v, k) => ({ k, s: k === i ? -Infinity : cosine(normed[i], v) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, KNN_K);

    for (const { k, s } of sims) {
      if (s < SIM_FLOOR) continue;
      const key = i < k ? `${i}-${k}` : `${k}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ source: titles[i], target: titles[k], weight: Number(s.toFixed(3)), kind: "semantic" });
    }
  }
  return links;
}

function reportAxes(titles: string[], coords: [number, number, number][]) {
  const axisNames = ["PC1 (X)", "PC2 (Y)", "PC3 (Z)"];
  console.log("\nAxis loadings — name each axis from its extremes:\n");
  for (let axis = 0; axis < 3; axis++) {
    const ranked = titles
      .map((t, i) => ({ t, v: coords[i][axis] }))
      .sort((a, b) => b.v - a.v);
    const high = ranked.slice(0, 4).map((r) => r.t).join(", ");
    const low = ranked.slice(-4).map((r) => r.t).reverse().join(", ");
    console.log(`  ${axisNames[axis]}`);
    console.log(`     +  ${high}`);
    console.log(`     -  ${low}\n`);
  }
}

// ---------- main ----------

async function main() {
  loadEnvFiles();

  const data: SkillData = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

  const flat: { title: string; category: string; level: string; description: string; text: string }[] = [];
  for (const cat of data.skills) {
    for (const item of cat.items) {
      flat.push({
        title: item.title,
        category: cat.category,
        level: item.level,
        description: item.description,
        text: `${item.title}. ${item.description}`, // pure semantic — no category in text
      });
    }
  }

  const useOpenAI = Boolean(process.env.OPENAI_API_KEY);
  console.log(
    useOpenAI
      ? `Embedding ${flat.length} skills with OpenAI ${EMBED_MODEL}…`
      : `No OPENAI_API_KEY — using local TF-IDF fallback for ${flat.length} skills.\n(Set OPENAI_API_KEY and re-run for real semantic positions.)`
  );

  const rawVecs = useOpenAI ? await embedWithOpenAI(flat.map((f) => f.text)) : tfidfVectors(flat.map((f) => f.text));
  const normed = l2normalize(rawVecs);
  const coords = declutter(pca3(normed), MIN_NODE_DIST, DECLUTTER_ITERS);

  const titles = flat.map((f) => f.title);
  reportAxes(titles, coords);

  const nodes: GraphNode[] = flat.map((f, i) => ({
    id: f.title,
    category: f.category,
    color: CATEGORY_COLORS[f.category] ?? FALLBACK_COLOR,
    isHub: false,
    x: Number(coords[i][0].toFixed(3)),
    y: Number(coords[i][1].toFixed(3)),
    z: Number(coords[i][2].toFixed(3)),
    level: f.level,
    description: f.description,
  }));

  const links: GraphLink[] = buildLinks(titles, normed);

  // category hub nodes at the centroid of their members + faint membership links
  const iconByCat = new Map(data.skills.map((c) => [c.category, c.icon]));
  for (const cat of data.skills) {
    const members = nodes.filter((nd) => nd.category === cat.category);
    if (!members.length) continue;
    const cx = members.reduce((a, m) => a + m.x, 0) / members.length;
    const cy = members.reduce((a, m) => a + m.y, 0) / members.length;
    const cz = members.reduce((a, m) => a + m.z, 0) / members.length;
    const hubId = `hub:${cat.category}`;
    nodes.push({
      id: hubId,
      category: cat.category,
      color: CATEGORY_COLORS[cat.category] ?? FALLBACK_COLOR,
      isHub: true,
      x: Number(cx.toFixed(3)),
      y: Number(cy.toFixed(3)),
      z: Number(cz.toFixed(3)),
      icon: iconByCat.get(cat.category),
    });
    for (const m of members) links.push({ source: hubId, target: m.id, weight: 0.2, kind: "member" });
  }

  const out = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: useOpenAI ? `openai:${EMBED_MODEL}` : "local:tfidf",
      axes: ["PC1", "PC2", "PC3"],
      categories: data.skills.map((c) => ({
        name: c.category,
        icon: c.icon,
        color: CATEGORY_COLORS[c.category] ?? FALLBACK_COLOR,
      })),
    },
    nodes,
    links,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote ${nodes.length} nodes and ${links.length} links → ${path.relative(ROOT, OUT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
