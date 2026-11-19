"use client";

import { useSyncExternalStore } from "react";

import { EMPTY_ARCHIVE, STORAGE_KEY, loadArchive, recordSearch, saveArchive, toggleWish } from "./store";
import type { Archive, SearchKind } from "./store";

// 로그인 전까지 기록과 관심 향수는 이 브라우저(localStorage)에만 저장한다.
let cache: Archive | null = null;
const listeners = new Set<() => void>();

function read(): Archive {
  if (!cache) cache = loadArchive(localStorage);
  return cache;
}

function write(next: Archive) {
  cache = next;
  saveArchive(localStorage, next);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useArchive() {
  const archive = useSyncExternalStore(subscribe, read, () => EMPTY_ARCHIVE);
  return {
    archive,
    toggleWish: (slug: string) => write(toggleWish(read(), slug)),
    record: (kind: SearchKind, items: string[]) => write(recordSearch(read(), kind, items, Date.now())),
  };
}
