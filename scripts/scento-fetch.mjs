// Scento Perfume API에서 향수 원본 응답을 받아 디렉터리에 캐시한다.
// 사용: node scripts/scento-fetch.mjs <출력 디렉터리> [노트당 최대 페이지=5]
// 출력: notes.json (노트별 전체 개수와 향수 목록), perfumes.json (슬러그별 상세 응답)
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE = "https://www.scento.com/api/perfume/v1";
const out = process.argv[2];
const maxPages = Number(process.argv[3] ?? 5);
if (!out) throw new Error("출력 디렉터리를 지정하세요");
await mkdir(out, { recursive: true });

// 시작 노트: 프로토타입의 음식 재료 연결 노트 + 향수에서 자주 나오는 노트
const SEED_NOTES = JSON.parse(await readFile(new URL("./seed-notes.json", import.meta.url), "utf8"));

async function get(path) {
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(BASE + path, { signal: AbortSignal.timeout(25000) });
      if (res.status === 404) return null;
      if (res.ok) return await res.json();
    } catch {}
    await new Promise((r) => setTimeout(r, 600 * (i + 1)));
  }
  return null;
}

async function pool(items, n, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    }),
  );
  return results;
}

const slugOf = (p) => {
  const m = /\/perfumes\/([^/?#]+)$/.exec(p.page || "");
  return m ? m[1] : null;
};

const notes = {};
await pool(SEED_NOTES, 6, async (note) => {
  const list = [];
  let total = 0;
  let cont = null;
  for (let page = 0; page < maxPages; page++) {
    const q = `/materials/match?materials=${encodeURIComponent(note)}${cont ? `&continuation=${cont}` : ""}`;
    const d = await get(q);
    if (!d) break;
    total = d.detail.total;
    list.push(...d.detail.perfumes);
    cont = d.continuation;
    if (!cont) break;
  }
  notes[note] = { total, perfumes: list };
  console.log("note", note, total, list.length);
});
// 한국어 노트 표에 있지만 향수 목록은 받지 않은 노트는 전체 개수(희소성 가중치용)만 받는다.
const NL = String.fromCharCode(10);
const koKeys = (await readFile(new URL("./notes-ko.txt", import.meta.url), "utf8"))
  .split(NL)
  .filter((l) => l.trim() && !l.startsWith("#"))
  .map((l) => l.split("|")[0].trim());
await pool(koKeys.filter((k) => !notes[k]), 6, async (note) => {
  const d = await get(`/materials/match?materials=${encodeURIComponent(note)}`);
  notes[note] = { total: d ? d.detail.total : 0, perfumes: [] };
});
await writeFile(join(out, "notes.json"), JSON.stringify(notes));

const targets = new Map();
for (const n of Object.values(notes)) {
  for (const p of n.perfumes) {
    const key = `${p.name}|${p.house}`;
    if (!targets.has(key)) targets.set(key, p);
  }
}
console.log("unique perfumes", targets.size);

const perfumes = {};
await pool([...targets.values()], 6, async (p) => {
  const slug = slugOf(p);
  const nameSlug = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const houseSlug = p.house.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  for (const s of [slug, `${nameSlug}-${houseSlug}`, nameSlug].filter(Boolean)) {
    const d = await get(`/perfumes/${s}`);
    if (d && d.detail && d.detail.name === p.name) {
      perfumes[s] = { slug: s, ...d.detail, cite: d.cite };
      return;
    }
  }
  console.log("miss", p.name, p.house);
});
await writeFile(join(out, "perfumes.json"), JSON.stringify(perfumes));
console.log("done", Object.keys(perfumes).length);
