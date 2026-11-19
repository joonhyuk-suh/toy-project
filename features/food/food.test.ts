import { describe, expect, it } from "vitest";

import { FOODS, filterFoods, getFood, parseFoodIds, personaOf, plateNotes, PRESETS, recommend, togglePick } from "./index";

describe("음식 목록", () => {
  it("30개이고 카테고리가 커피·차 9, 음료 3, 디저트 10, 과일 5, 술 3이다", () => {
    expect(FOODS).toHaveLength(30);
    const count = (c: string) => FOODS.filter((f) => f.category === c).length;
    expect([count("커피·차"), count("음료"), count("디저트"), count("과일"), count("술")]).toEqual([9, 3, 10, 5, 3]);
  });

  it("홈의 정해 둔 조합 4개는 모두 존재하는 음식으로 이루어진다", () => {
    expect(PRESETS).toHaveLength(4);
    for (const p of PRESETS) for (const id of p.foods) expect(getFood(id)).toBeDefined();
  });
});

describe("filterFoods: 카테고리와 이름 검색", () => {
  it("카테고리로 거른다", () => {
    expect(filterFoods({ category: "과일", query: "" }).every((f) => f.category === "과일")).toBe(true);
    expect(filterFoods({ category: "전체", query: "" })).toHaveLength(30);
  });

  it("음식 이름, 다른 이름, 재료 이름에 걸린다", () => {
    expect(filterFoods({ category: "전체", query: "라떼" }).map((f) => f.id)).toEqual(
      expect.arrayContaining(["latte", "matcha"]),
    ); // 이름(바닐라라떼, 말차라떼)
    expect(filterFoods({ category: "전체", query: "마카롱" }).map((f) => f.id)).toContain("rosemacaron");
    expect(filterFoods({ category: "전체", query: "탄산수" }).map((f) => f.id)).toEqual(
      expect.arrayContaining(["lemonade", "highball"]),
    ); // 재료 이름
    expect(filterFoods({ category: "전체", query: "차이 라떼" }).map((f) => f.id)).toContain("chai"); // 다른 이름
  });

  it("없는 음식은 빈 목록이다", () => {
    expect(filterFoods({ category: "전체", query: "마라탕" })).toEqual([]);
  });
});

describe("togglePick: 1–5개 선택", () => {
  it("고른 순서대로 쌓이고, 다시 누르면 풀린다", () => {
    let p: string[] = [];
    p = togglePick(p, "latte");
    p = togglePick(p, "choco");
    expect(p).toEqual(["latte", "choco"]);
    expect(togglePick(p, "latte")).toEqual(["choco"]);
  });

  it("5개를 고르면 더 고를 수 없다", () => {
    const five = ["latte", "choco", "fig", "peach", "pear"];
    expect(togglePick(five, "cherry")).toEqual(five);
    expect(togglePick(five, "pear")).toEqual(["latte", "choco", "fig", "peach"]);
  });
});

describe("parseFoodIds: 링크에서 읽은 음식", () => {
  it("알 수 없는 음식과 중복을 버리고 5개까지만 읽는다", () => {
    expect(parseFoodIds("latte,nope,latte,choco")).toEqual(["latte", "choco"]);
    expect(parseFoodIds("latte,choco,fig,peach,pear,cherry")).toHaveLength(5);
    expect(parseFoodIds(null)).toEqual([]);
  });
});

describe("plateNotes: 함께 들어 있는 재료", () => {
  it("2개 이상의 음식에 든 재료를 common으로, 나머지를 solo로 나눈다", () => {
    const { common, solo } = plateNotes(["latte", "choco", "earlgrey"]);
    // 바닐라라떼(커피·우유·바닐라) + 초코 케이크(초콜릿·바닐라) + 얼그레이(차·베르가못)
    expect(common.map((c) => [c.note, c.foods.length])).toEqual([["Vanilla", 2]]);
    expect(solo.map((c) => c.note).sort()).toEqual(["Bergamot", "Chocolate", "Coffee", "Milk", "Tea"]);
  });

  it("향수에 거의 쓰이지 않는 재료(연결 노트 없음)는 재료 목록에 나오지 않는다", () => {
    const { common, solo } = plateNotes(["honeytoast"]);
    expect([...common, ...solo].map((c) => c.note)).toEqual(["Honey"]);
  });
});

describe("recommend: 음식 조합의 추천 향수", () => {
  it("점수 높은 순으로 정렬되고, 겹치는 재료가 하나 이상 있다", () => {
    const r = recommend(["latte", "choco", "earlgrey"]);
    expect(r.length).toBeGreaterThan(3);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].match.pct).toBeGreaterThanOrEqual(r[i].match.pct);
    expect(r.every((x) => x.match.hit.length > 0)).toBe(true);
  });

  it("같은 음식 조합이면 순서와 상관없이 같은 결과다", () => {
    const a = recommend(["latte", "choco"]).map((x) => [x.perfume.slug, x.match.pct]);
    const b = recommend(["choco", "latte"]).map((x) => [x.perfume.slug, x.match.pct]);
    expect(a).toEqual(b);
  });

  it("음식이 없으면 빈 목록이다", () => {
    expect(recommend([])).toEqual([]);
  });

  it("각 향수에는 겹치는 재료가 나온 음식 이름이 붙는다", () => {
    const first = recommend(["latte", "choco"])[0];
    for (const n of first.match.hit) expect(first.match.foodsByNote[n].length).toBeGreaterThan(0);
  });
});

describe("personaOf: 1위 향수 계열로 정한 유형 이름", () => {
  it.each([
    ["sweet", "포근한 디저트파"],
    ["green", "차분한 티타임파"],
    ["citrus", "상큼한 에이드파"],
    ["fruit", "과즙 가득 과일파"],
    ["floral", "로맨틱 꽃다발파"],
    ["musk", "깨끗한 살냄새파"],
    ["spice", "따뜻한 향신료파"],
    ["wood", "나만의 조합파"],
  ] as const)("%s -> %s", (family, name) => {
    expect(personaOf(family)).toBe(name);
  });
});
