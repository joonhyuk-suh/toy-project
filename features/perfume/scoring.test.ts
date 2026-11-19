import { describe, expect, it } from "vitest";

import { matchFoods, matchNotes, noteWeight } from "./scoring";
import type { Perfume } from "./types";

const make = (over: Partial<Perfume>): Perfume => ({
  slug: "x",
  name: "X",
  house: "H",
  conc: "edp",
  family: "sweet",
  pyramid: null,
  notes: [],
  sig: [],
  seasons: [],
  hours: [],
  words: [],
  line: "",
  ...over,
});

// 흔한 노트(바닐라 582개)와 드문 노트(위스키 3개)
const totals: Record<string, number> = { Vanilla: 582, Whisky: 3, Coffee: 43, Milk: 7 };
const weight = (n: string) => noteWeight(totals[n] ?? 100);

describe("matchNotes: 고른 재료와 향수의 궁합", () => {
  it("겹치는 재료가 하나도 없으면 결과에서 빠진다", () => {
    expect(matchNotes(make({ notes: ["Rose"] }), ["Coffee"], "any", weight)).toBeNull();
  });

  it("같은 입력이면 항상 같은 점수다", () => {
    const p = make({ notes: ["Coffee", "Vanilla"] });
    expect(matchNotes(p, ["Coffee", "Vanilla"], "any", weight)).toEqual(
      matchNotes(p, ["Coffee", "Vanilla"], "any", weight),
    );
  });

  it("더 드문 재료가 겹칠수록 점수가 높다", () => {
    const rare = matchNotes(make({ notes: ["Whisky"] }), ["Whisky", "Vanilla"], "any", weight);
    const common = matchNotes(make({ notes: ["Vanilla"] }), ["Whisky", "Vanilla"], "any", weight);
    expect(rare!.pct).toBeGreaterThan(common!.pct);
  });

  it("그 재료가 핵심 재료이면 점수가 더 높다", () => {
    const sig = matchNotes(make({ notes: ["Coffee", "Rose"], sig: ["Coffee"] }), ["Coffee", "Milk"], "any", weight);
    const plain = matchNotes(make({ notes: ["Coffee", "Rose"], sig: ["Rose"] }), ["Coffee", "Milk"], "any", weight);
    expect(sig!.pct).toBeGreaterThan(plain!.pct);
  });

  it("층을 고르면 그 층에 든 재료만 겹친 것으로 센다", () => {
    const p = make({ notes: ["Coffee", "Rose"], pyramid: { top: ["Rose"], heart: [], base: ["Coffee"] } });
    expect(matchNotes(p, ["Coffee"], "top", weight)).toBeNull();
    expect(matchNotes(p, ["Coffee"], "base", weight)!.hit).toEqual(["Coffee"]);
  });

  it("층 정보가 없는 향수는 층을 고르면 빠진다", () => {
    expect(matchNotes(make({ notes: ["Coffee"] }), ["Coffee"], "top", weight)).toBeNull();
  });

  it("점수는 98%를 넘지 않는다", () => {
    const p = make({ notes: ["Coffee"], sig: ["Coffee"] });
    expect(matchNotes(p, ["Coffee"], "any", weight)!.pct).toBeLessThanOrEqual(98);
  });
});

describe("matchFoods: 음식 조합과 향수의 궁합", () => {
  const foods = [
    { id: "a", notes: ["Coffee"] },
    { id: "b", notes: ["Coffee", "Milk"] },
    { id: "c", notes: ["Whisky"] },
  ];

  it("더 많은 음식과 이어질수록 점수가 높다", () => {
    const two = matchFoods(make({ notes: ["Coffee"] }), foods, weight)!; // a, b
    const one = matchFoods(make({ notes: ["Milk"] }), foods, weight)!; // b
    expect(two.pct).toBeGreaterThan(one.pct);
  });

  it("겹치는 재료와 그 재료가 나온 음식을 돌려준다", () => {
    const m = matchFoods(make({ notes: ["Coffee", "Rose"] }), foods, weight)!;
    expect(m.hit).toEqual(["Coffee"]);
    expect(m.foodsByNote.Coffee).toEqual(["a", "b"]);
  });

  it("어떤 음식과도 이어지지 않으면 빠진다", () => {
    expect(matchFoods(make({ notes: ["Rose"] }), foods, weight)).toBeNull();
  });
});
