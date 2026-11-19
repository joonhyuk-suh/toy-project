import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈은 음식으로 찾기와 전문가 모드로 가는 입구, 정해 둔 조합 4개를 보여 준다", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("좋아하는 맛에서");
  expect(screen.getAllByRole("link", { name: "음식으로 찾기" })[0]).toHaveAttribute("href", "/food");
  expect(screen.getAllByRole("link", { name: "전문가 모드" })[0]).toHaveAttribute("href", "/expert");
  const combo = screen.getByRole("link", { name: "포근한 디저트파" });
  expect(combo).toHaveAttribute("href", "/results?foods=latte,choco,earlgrey");
});
