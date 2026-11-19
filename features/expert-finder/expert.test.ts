import { describe, expect, it } from "vitest";

import { MAX_NOTES, notesOfFamily, parseExpertQuery, relaxConditions, searchExpert, toggleNote, toExpertQuery } from "./index";

describe("toggleNote: 재료는 최대 4개", () => {
  it("체크하면 쌓이고 다시 누르면 빠진다", () => {
    expect(toggleNote(["Coffee"], "Vanilla")).toEqual(["Coffee", "Vanilla"]);
    expect(toggleNote(["Coffee", "Vanilla"], "Coffee")).toEqual(["Vanilla"]);
  });
  it("4개가 차면 새 재료는 더해지지 않는다", () => {
    const four = ["Coffee", "Vanilla", "Rose", "Musk"];
    expect(MAX_NOTES).toBe(4);
    expect(toggleNote(four, "Amber")).toEqual(four);
  });
});

describe("notesOfFamily", () => {
  it("계열의 재료를 한국어 이름으로 찾을 수 있게 돌려준다", () => {
    const sweet = notesOfFamily("sweet");
    expect(sweet.map((n) => n.key)).toEqual(expect.arrayContaining(["Coffee", "Vanilla"]));
    expect(sweet.find((n) => n.key === "Coffee")?.ko).toBe("커피");
  });
});

describe("searchExpert: 재료·층·지속 시간 조건으로 찾기", () => {
  it("재료가 없으면 빈 목록이다", () => {
    expect(searchExpert({ notes: [], layer: "any", durations: [] })).toEqual([]);
  });

  it("재료가 하나라도 겹치는 향수가 점수 순으로 나온다", () => {
    const r = searchExpert({ notes: ["Coffee", "Vanilla"], layer: "any", durations: [] });
    expect(r.length).toBeGreaterThan(5);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].match.pct).toBeGreaterThanOrEqual(r[i].match.pct);
  });

  it("층 조건을 고르면 층 정보가 없는 향수는 빠지고 그 층에 든 향수만 남는다", () => {
    const r = searchExpert({ notes: ["Coffee"], layer: "top", durations: [] });
    expect(r.length).toBeGreaterThan(0);
    for (const x of r) expect(x.perfume.pyramid!.top).toContain("Coffee");
  });

  it("지속 시간 조건은 농도 구간으로 거르고, 여러 개를 고르면 합친다", () => {
    const long = searchExpert({ notes: ["Vanilla"], layer: "any", durations: ["long"] });
    expect(long.every((x) => x.perfume.conc === "edp")).toBe(true);
    const both = searchExpert({ notes: ["Vanilla"], layer: "any", durations: ["short", "mid"] });
    expect(both.every((x) => x.perfume.conc === "edc" || x.perfume.conc === "edt")).toBe(true);
    expect(both.length).toBeGreaterThan(0);
  });

  it("조건을 모두 걸면 0개가 될 수 있고, 조건 풀기는 층을 전체로 지속 시간을 비운다", () => {
    const tight = { notes: ["Whisky", "Fig"], layer: "top" as const, durations: ["short" as const] };
    expect(searchExpert(tight)).toEqual([]);
    const relaxed = relaxConditions(tight);
    expect(relaxed).toEqual({ notes: ["Whisky", "Fig"], layer: "any", durations: [] });
    expect(searchExpert(relaxed).length).toBeGreaterThan(0);
  });
});

describe("주소 조건 변환", () => {
  it("조건을 주소 문자열로 바꿨다가 그대로 읽는다", () => {
    const q = { notes: ["Coffee", "Vanilla"], layer: "base" as const, durations: ["long" as const], family: "sweet" as const };
    expect(parseExpertQuery(new URLSearchParams(toExpertQuery(q)))).toEqual(q);
  });
  it("모르는 값은 버리고 재료는 4개까지만 읽는다", () => {
    const p = new URLSearchParams("notes=Coffee,Nope,Vanilla,Rose,Musk,Amber&layer=zzz&dur=short,zzz&fam=zzz");
    expect(parseExpertQuery(p)).toEqual({ notes: ["Coffee", "Vanilla", "Rose", "Musk"], layer: "any", durations: ["short"], family: "sweet" });
  });
});
