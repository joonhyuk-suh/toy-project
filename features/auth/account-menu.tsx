"use client";

import { LogIn, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const ICON = { className: "size-4", strokeWidth: 1.3, "aria-hidden": true } as const;
const ITEM = buttonVariants({ variant: "ghost", size: "sm" });

/** 상단 메뉴의 계정 영역. 로그아웃 상태는 로그인 링크만, 로그인 상태는 설정 링크와 로그아웃만 보인다. */
export function AccountMenu({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  if (!signedIn) {
    const keepHere = pathname !== "/" && !pathname.startsWith("/auth");
    const href = keepHere ? `/auth/login?next=${encodeURIComponent(pathname)}` : "/auth/login";
    return (
      <Link href={href} className={ITEM}>
        <LogIn {...ICON} />
        로그인
      </Link>
    );
  }

  const signOut = async () => {
    setPending(true);
    await createClient().auth.signOut();
    // 서버에서 그린 상단 메뉴와 보호된 화면(/settings)을 새 세션 상태로 다시 그린다.
    router.refresh();
    setPending(false);
  };

  return (
    <div className="flex items-center gap-1">
      <Link href="/settings" className={ITEM}>
        <Settings {...ICON} />
        설정
      </Link>
      <Button variant="ghost" size="sm" onClick={signOut} disabled={pending}>
        <LogOut {...ICON} />
        로그아웃
      </Button>
    </div>
  );
}
