export type FamilyId =
  | "citrus"
  | "fruit"
  | "green"
  | "floral"
  | "white"
  | "powder"
  | "musk"
  | "sweet"
  | "amber"
  | "spice"
  | "smoke"
  | "wood";

export type Layer = "top" | "heart" | "base";
export type LayerFilter = Layer | "any";

export type Concentration = "edc" | "edt" | "edp" | "parfum" | "extrait" | "elixir";

/** 지속 시간 구간. 향수 농도에서 추정한다. */
export type DurationBand = "short" | "mid" | "long" | "xlong";

export type Pyramid = Record<Layer, string[]>;

export type Perfume = {
  slug: string;
  name: string;
  house: string;
  conc: Concentration | null;
  family: FamilyId;
  pyramid: Pyramid | null;
  /** 층 구분과 관계없이 들어간 모든 노트 */
  notes: string[];
  /** 핵심 재료 */
  sig: string[];
  seasons: string[];
  hours: string[];
  words: string[];
  line: string;
};

export type NoteInfo = {
  ko: string;
  analogy: string;
  family: FamilyId;
  /** Scento 전체에서 이 노트가 들어간 향수 수 */
  total: number;
};

export type Match = { pct: number; hit: string[] };
