import { redirect } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { getMyProfile, SettingsForm } from "@/features/profile";

export const metadata = { title: "설정 · 향 아카이브" };

const dateFormat = new Intl.DateTimeFormat("ko-KR", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Seoul" });

export default async function SettingsPage() {
  // proxy.ts가 먼저 막지만, 화면도 서버가 확인한 사용자로만 그린다.
  const profile = await getMyProfile();
  if (!profile) redirect("/auth/login?next=/settings");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 py-2 sm:py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl">설정</h1>
        <p className="text-sm text-muted-foreground">
          가입일 {dateFormat.format(new Date(profile.created_at))} · 마지막 수정{" "}
          {dateFormat.format(new Date(profile.updated_at))}
        </p>
      </div>
      <Card>
        <CardContent>
          <SettingsForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
