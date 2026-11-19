"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { saveDisplayName, type SaveState } from "./actions";
import type { Profile } from "./queries";

const INITIAL: SaveState = { status: "idle" };

/** 이메일은 읽기 전용, 표시 이름만 고칠 수 있는 설정 폼. */
export function SettingsForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(saveDisplayName, INITIAL);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" value={profile.email} readOnly disabled />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="display_name">표시 이름</Label>
        <Input
          id="display_name"
          name="display_name"
          maxLength={40}
          placeholder="향 기록에 보일 이름"
          defaultValue={profile.display_name ?? ""}
        />
      </div>
      {state.status !== "idle" && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={state.status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
        >
          {state.message}
        </p>
      )}
      <Button type="submit" size="lg" className="self-start" disabled={pending}>
        {pending ? "저장하는 중…" : "저장"}
      </Button>
    </form>
  );
}
