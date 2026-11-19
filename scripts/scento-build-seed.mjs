// scento-fetch.mjs가 받은 원본과 notes-ko.txt(손으로 쓴 한국어 노트 표)로 앱이 쓰는 사본을 만든다.
// 사용: node scripts/scento-build-seed.mjs <원본 디렉터리>
// 출력: features/perfume/data/seed.json
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const raw = process.argv[2];
if (!raw) throw new Error("원본 디렉터리를 지정하세요");
const perfumesRaw = JSON.parse(await readFile(join(raw, "perfumes.json"), "utf8"));
const notesRaw = JSON.parse(await readFile(join(raw, "notes.json"), "utf8"));

const notes = {};
for (const line of (await readFile(new URL("./notes-ko.txt", import.meta.url), "utf8")).split("\n")) {
  if (!line.trim() || line.startsWith("#")) continue;
  const [key, ko, analogy, family] = line.trim().split("|");
  const total = notesRaw[key]?.total ?? 0;
  notes[key] = { ko, analogy, family, total };
}

const FAMILY = {
  "Sunlit Citrus": "citrus", "Orchard Fruit": "fruit", "Green Leaf": "green", "Petal Garden": "floral",
  "White Bloom": "white", "Powder Veil": "powder", "Skin Musk": "musk", "Velvet Sweet": "sweet",
  "Amber & Resin": "amber", "Spice Route": "spice", "Smoke & Leather": "smoke", "Wood & Root": "wood",
};
const CONC = {
  "eau de cologne": "edc", "eau de toilette": "edt", "eau de parfum": "edp",
  parfum: "parfum", "extrait de parfum": "extrait", elixir: "elixir",
};
const SEASON = { spring: "봄", summer: "여름", autumn: "가을", winter: "겨울" };
const HOUR = { day: "낮", evening: "저녁", night: "밤" };
const WORD = {
  floral: "플로럴", warm: "따뜻함", citrusy: "상큼함", fresh: "산뜻함", sweet: "달콤함", spicy: "스파이시",
  fruity: "과일 향", woody: "우디함", earthy: "흙 내음", creamy: "크리미", herbal: "허브 향", powdery: "파우더리",
  resinous: "수지 향", green: "풀 향", musky: "머스크", amber: "앰버", smoky: "스모키", salty: "짭조름함",
  leathery: "가죽 향", clean: "깨끗함", rich: "진함",
};
const TAIL = {
  sweet: "달콤하고 포근한 느낌이에요.", citrus: "상큼하고 시원하게 퍼져요.", fruit: "과즙처럼 싱그럽게 퍼져요.",
  green: "풀잎처럼 맑고 차분해요.", floral: "꽃다발처럼 화사해요.", white: "진하고 우아한 하얀 꽃 느낌이에요.",
  powder: "보송하고 부드러운 파우더 느낌이에요.", musk: "깨끗한 살결처럼 포근해요.", amber: "따뜻하고 깊게 감싸 줘요.",
  spice: "따뜻하고 알싸하게 퍼져요.", smoke: "그윽하고 묵직한 여운이 남아요.", wood: "차분한 나뭇결처럼 이어져요.",
};
// 받침 유무로 조사를 고른다.
const hasBatchim = (s) => { const c = s.charCodeAt(s.length - 1) - 0xac00; return c >= 0 && c <= 11171 && c % 28 !== 0; };
const josa = (s, a, b) => s + (hasBatchim(s) ? a : b);

const perfumes = [];
for (const p of Object.values(perfumesRaw)) {
  const family = FAMILY[p.family];
  if (!family) continue;
  const pyramid = p.pyramid
    ? { top: p.pyramid.top ?? [], heart: p.pyramid.heart ?? [], base: p.pyramid.base ?? [] }
    : null;
  const all = pyramid ? [...new Set([...pyramid.top, ...pyramid.heart, ...pyramid.base])] : [...new Set(p.notes ?? [])];
  if (!all.length || all.some((n) => !notes[n])) continue;
  const sig = (p.signature_materials ?? []).filter((n) => all.includes(n));
  const lead = (sig.length ? sig : all).slice(0, 2).map((n) => notes[n].analogy);
  const subject = lead.length === 2 ? `${josa(lead[0], "과", "와")} ${josa(lead[1], "이", "가")}` : josa(lead[0], "이", "가");
  perfumes.push({
    slug: p.slug,
    name: p.name,
    house: p.house,
    conc: CONC[p.concentration] ?? null,
    family,
    pyramid,
    notes: pyramid ? undefined : all,
    sig,
    seasons: (p.wears?.seasons ?? []).map((s) => SEASON[s]).filter(Boolean),
    hours: (p.wears?.hours ?? []).map((s) => HOUR[s]).filter(Boolean),
    words: (p.character_words ?? []).map((w) => WORD[w]).filter(Boolean),
    line: `${subject} 중심이고, ${TAIL[family]}`,
  });
}
perfumes.sort((a, b) => a.slug.localeCompare(b.slug));

const usedNotes = new Set(perfumes.flatMap((p) => [...(p.pyramid ? [...p.pyramid.top, ...p.pyramid.heart, ...p.pyramid.base] : p.notes)]));
// 음식 재료 연결에 쓰는 노트는 사용 여부와 관계없이 남긴다.
const foodNotes = JSON.parse(await readFile(new URL("./food-notes.json", import.meta.url), "utf8"));
const outNotes = Object.fromEntries(Object.entries(notes).filter(([k]) => usedNotes.has(k) || foodNotes.includes(k)));

const seed = {
  source: "Scento Perfume API, scento.com",
  fetchedAt: new Date().toISOString().slice(0, 10),
  notes: outNotes,
  perfumes,
};
await writeFile(new URL("../features/perfume/data/seed.json", import.meta.url), JSON.stringify(seed));
console.log("perfumes", perfumes.length, "notes", Object.keys(outNotes).length);
