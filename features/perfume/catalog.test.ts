import { describe, expect, it } from "vitest";

import { durationOf, FAMILIES, findSimilar, getPerfume, listPerfumes, noteInfo } from "./catalog";
import type { Perfume } from "./types";

describe("향 계열", () => {
  it("12개이고 각자 다른 색을 가진다", () => {
    expect(FAMILIES).toHaveLength(12);
    expect(new Set(FAMILIES.map((f) => f.color)).size).toBe(12);
    expect(FAMILIES.map((f) => f.ko)).toEqual(
      expect.arrayContaining(["시트러스", "과일", "그린·차", "꽃", "하얀 꽃", "파우더리", "살냄새", "달콤함", "앰버", "스파이스", "스모키", "우디"]),
    );
  });
});

describe("향수 사본", () => {
  it("모든 향수의 모든 노트가 한국어 이름과 비유를 가진다", () => {
    const missing = listPerfumes().flatMap((p) => p.notes.filter((n) => !noteInfo(n)?.ko || !noteInfo(n)?.analogy));
    expect(missing).toEqual([]);
  });

  it("슬러그로 향수를 찾고, 없으면 undefined", () => {
    const first = listPerfumes()[0];
    expect(getPerfume(first.slug)).toBe(first);
    expect(getPerfume("no-such-perfume")).toBeUndefined();
  });

  it("층 정보가 없는 향수도 notes에 들어간 재료가 모두 있다", () => {
    const flat = listPerfumes().filter((p) => !p.pyramid);
    expect(flat.length).toBeGreaterThan(0);
    expect(flat.every((p) => p.notes.length > 0)).toBe(true);
  });
});

describe("durationOf: 농도로 지속 시간 추정", () => {
  const cases: [Perfume["conc"], string | null][] = [
    ["edc", "short"],
    ["edt", "mid"],
    ["edp", "long"],
    ["parfum", "xlong"],
    ["extrait", "xlong"],
    [null, null],
  ];
  it.each(cases)("%s -> %s", (conc, band) => {
    expect(durationOf(conc)?.band ?? null).toBe(band);
  });

  it("구간별 시간 문구", () => {
    expect(durationOf("edc")?.hours).toBe("1–2시간");
    expect(durationOf("edt")?.hours).toBe("3–4시간");
    expect(durationOf("edp")?.hours).toBe("5–6시간");
    expect(durationOf("parfum")?.hours).toBe("7시간 이상");
  });
});

describe("findSimilar: 겹치는 재료 수와 같은 계열로 비슷한 향수 고르기", () => {
  it("자기 자신을 빼고 3개를 돌려주며, 같은 입력이면 같은 순서다", () => {
    const p = listPerfumes()[0];
    const a = findSimilar(p, 3);
    expect(a).toHaveLength(3);
    expect(a.map((x) => x.slug)).not.toContain(p.slug);
    expect(findSimilar(p, 3).map((x) => x.slug)).toEqual(a.map((x) => x.slug));
  });

  it("첫 번째 결과가 마지막 결과보다 겹침이 적지 않다", () => {
    const p = getPerfume(listPerfumes()[10].slug)!;
    const score = (o: Perfume) => o.notes.filter((n) => p.notes.includes(n)).length + (o.family === p.family ? 1 : 0);
    const r = findSimilar(p, 3);
    expect(score(r[0])).toBeGreaterThanOrEqual(score(r[2]));
  });
});
