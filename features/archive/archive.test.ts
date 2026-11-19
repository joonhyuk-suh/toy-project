import { describe, expect, it } from "vitest";

import { EMPTY_ARCHIVE, loadArchive, recordSearch, relativeTime, saveArchive, toggleWish } from "./store";

const mem = (initial?: string) => {
  const data = new Map<string, string>(initial === undefined ? [] : [["scent-archive", initial]]);
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
};

describe("recordSearch: 최근에 찾은 것", () => {
  it("최근 순으로 쌓는다", () => {
    let a = recordSearch(EMPTY_ARCHIVE, "food", ["latte"], 1000);
    a = recordSearch(a, "expert", ["Coffee"], 2000);
    expect(a.history.map((h) => h.items)).toEqual([["Coffee"], ["latte"]]);
  });

  it("같은 조합은 한 번만 남고 맨 앞으로 올라온다", () => {
    let a = recordSearch(EMPTY_ARCHIVE, "food", ["latte", "choco"], 1000);
    a = recordSearch(a, "food", ["fig"], 2000);
    a = recordSearch(a, "food", ["latte", "choco"], 3000);
    expect(a.history).toHaveLength(2);
    expect(a.history[0]).toEqual({ kind: "food", items: ["latte", "choco"], at: 3000 });
  });

  it("음식과 전문가 기록은 항목이 같아도 다른 기록이다", () => {
    let a = recordSearch(EMPTY_ARCHIVE, "food", ["x"], 1);
    a = recordSearch(a, "expert", ["x"], 2);
    expect(a.history).toHaveLength(2);
  });

  it("최대 8개만 남긴다", () => {
    let a = EMPTY_ARCHIVE;
    for (let i = 0; i < 10; i++) a = recordSearch(a, "food", [`f${i}`], i);
    expect(a.history).toHaveLength(8);
    expect(a.history[0].items).toEqual(["f9"]);
  });

  it("빈 항목은 기록하지 않는다", () => {
    expect(recordSearch(EMPTY_ARCHIVE, "food", [], 1)).toBe(EMPTY_ARCHIVE);
  });
});

describe("toggleWish: 관심 향수", () => {
  it("담고 다시 누르면 뺀다", () => {
    const a = toggleWish(EMPTY_ARCHIVE, "black-opium");
    expect(a.wish).toEqual(["black-opium"]);
    expect(toggleWish(a, "black-opium").wish).toEqual([]);
  });
});

describe("저장과 불러오기: 새로 고쳐도 남는다", () => {
  it("저장한 것을 그대로 불러온다", () => {
    const s = mem();
    const a = toggleWish(recordSearch(EMPTY_ARCHIVE, "food", ["latte"], 5), "black-opium");
    saveArchive(s, a);
    expect(loadArchive(s)).toEqual(a);
  });

  it("저장된 것이 없거나 깨져 있으면 빈 상태로 시작한다", () => {
    expect(loadArchive(mem())).toEqual(EMPTY_ARCHIVE);
    expect(loadArchive(mem("{깨짐"))).toEqual(EMPTY_ARCHIVE);
    expect(loadArchive(mem(JSON.stringify({ wish: "x", history: 3 })))).toEqual(EMPTY_ARCHIVE);
  });
});

describe("relativeTime", () => {
  const now = 10 * 24 * 3600_000;
  it.each([
    [now - 5_000, "방금"],
    [now - 5 * 60_000, "5분 전"],
    [now - 3 * 3600_000, "3시간 전"],
    [now - 3 * 24 * 3600_000, "3일 전"],
    [now - 8 * 24 * 3600_000, "1주 전"],
  ])("%s -> %s", (at, text) => {
    expect(relativeTime(at, now)).toBe(text);
  });
});
