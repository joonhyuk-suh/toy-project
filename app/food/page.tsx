import { Suspense } from "react";

import { FoodFinder } from "@/features/food-finder";

export default function FoodPage() {
  return (
    <Suspense>
      <FoodFinder />
    </Suspense>
  );
}
