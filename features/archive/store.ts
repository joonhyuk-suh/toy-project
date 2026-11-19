export type SearchKind = "food" | "expert";
export type HistoryEntry = { kind: SearchKind; items: string[]; at: number };
export type Archive = { wish: string[]; history: HistoryEntry[] };

export const EMPTY_ARCHIVE: Archive = { wish: [], history: [] };
export const HISTORY_LIMIT = 8;
export const STORAGE_KEY = "scent-archive";

const keyOf = (kind: SearchKind, items: string[]) => `${kind}:${items.join(",")}`;

/** 찾은 결과를 기록한다. 같은 조합은 한 번만 남고 맨 앞으로 올라온다. */
export function recordSearch(a: Archive, kind: SearchKind, items: string[], at: number): Archive {
  if (!items.length) return a;
  const key = keyOf(kind, items);
  const history = [{ kind, items: [...items], at }, ...a.history.filter((h) => keyOf(h.kind, h.items) !== key)];
  return { ...a, history: history.slice(0, HISTORY_LIMIT) };
}

export function toggleWish(a: Archive, slug: string): Archive {
  return { ...a, wish: a.wish.includes(slug) ? a.wish.filter((s) => s !== slug) : [...a.wish, slug] };
}

const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const isEntry = (v: unknown): v is HistoryEntry =>
  !!v &&
  typeof v === "object" &&
  ((v as HistoryEntry).kind === "food" || (v as HistoryEntry).kind === "expert") &&
  isStrings((v as HistoryEntry).items) &&
  typeof (v as HistoryEntry).at === "number";

export function loadArchive(storage: Pick<Storage, "getItem">): Archive {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_ARCHIVE;
    const data = JSON.parse(raw) as Partial<Archive>;
    if (!isStrings(data.wish) || !Array.isArray(data.history) || !data.history.every(isEntry)) return EMPTY_ARCHIVE;
    return { wish: data.wish, history: data.history.slice(0, HISTORY_LIMIT) };
  } catch {
    return EMPTY_ARCHIVE;
  }
}

export function saveArchive(storage: Pick<Storage, "setItem">, a: Archive): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch {
    // 저장 공간이 막혀 있어도 화면은 계속 동작한다.
  }
}

export function relativeTime(at: number, now: number): string {
  const min = Math.floor((now - at) / 60_000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${Math.floor(days / 7)}주 전`;
}
