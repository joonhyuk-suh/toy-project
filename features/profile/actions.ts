"use server";

import { refresh } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type SaveState = { status: "idle" | "saved" | "error"; message?: string };

const MAX_LENGTH = 40;

/** 표시 이름만 바꾼다. 다른 컬럼은 DB 권한(update(display_name))으로도 막혀 있다. */
export async function saveDisplayName(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const raw = String(formData.get("display_name") ?? "").trim();
  if (raw.length > MAX_LENGTH) {
    return { status: "error", message: `표시 이름은 ${MAX_LENGTH}자 이하로 적어 주세요.` };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { status: "error", message: "로그인이 풀렸어요. 다시 로그인해 주세요." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: raw || null })
    .eq("id", userId);
  if (error) return { status: "error", message: "저장하지 못했어요. 다시 시도해 주세요." };

  refresh();
  return { status: "saved", message: "저장했어요." };
}
