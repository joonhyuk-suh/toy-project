import { describe, expect, it } from "vitest";

import { tasteProfile } from "./taste";

describe("tasteProfile: 탐색 성향", () => {
  it("전문가 기록의 재료를 세어 자주 나온 순으로 보여 준다", () => {
    const t = tasteProfile({
      wish: [],
      history: [
        { kind: "expert", items: ["Coffee", "Vanilla"], at: 1 },
        { kind: "expert", items: ["Coffee", "Rose"], at: 2 },
      ],
    });
    expect(t.topNotes[0]).toEqual({ note: "Coffee", count: 2 });
    expect(t.topNotes).toHaveLength(3);
  });

  it("끌리는 계열 비율은 재료 횟수 기준이다", () => {
    const t = tasteProfile({
      wish: [],
      history: [
        { kind: "expert", items: ["Coffee", "Vanilla"], at: 1 },
        { kind: "expert", items: ["Coffee", "Rose"], at: 2 },
      ],
    });
    // Coffee 2 + Vanilla 1 = 달콤함 3, Rose 1 = 꽃 1
    expect(t.families).toEqual([
      { family: "sweet", pct: 75 },
      { family: "floral", pct: 25 },
    ]);
  });

  it("음식 기록은 음식에 든 재료로 센다", () => {
    const t = tasteProfile({ wish: [], history: [{ kind: "food", items: ["latte"], at: 1 }] }); // 커피·우유·바닐라
    expect(t.topNotes.map((n) => n.note).sort()).toEqual(["Coffee", "Milk", "Vanilla"]);
  });

  it("관심 향수는 핵심 재료로 센다", () => {
    const t = tasteProfile({ wish: ["black-opium-intense-yves-saint-laurent"], history: [] }); // 핵심: 감초, 바닐라, 커피
    expect(t.topNotes.map((n) => n.note).sort()).toEqual(["Coffee", "Liquorice", "Vanilla"]);
  });

  it("재료는 5개까지만 보이고, 기록이 없으면 비어 있다", () => {
    const t = tasteProfile({ wish: [], history: [{ kind: "expert", items: ["Coffee", "Vanilla", "Rose", "Musk"], at: 1 }, { kind: "expert", items: ["Amber", "Fig"], at: 2 }] });
    expect(t.topNotes).toHaveLength(5);
    expect(tasteProfile({ wish: [], history: [] })).toEqual({ topNotes: [], families: [] });
  });
});
