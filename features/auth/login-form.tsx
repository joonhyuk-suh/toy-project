"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeNextPath } from "@/lib/safe-next-path";
import { createClient } from "@/lib/supabase/client";

import { authErrorMessage } from "./messages";

/** 이메일·비밀번호 로그인. Supabase UI Password-based Auth 블록의 login-form을 이 앱에 맞게 고친 것. */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const next = useSearchParams().get("next");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      // 서버에서 그린 상단 메뉴도 로그인 상태로 다시 그린다.
      router.push(safeNextPath(next, "/"));
      router.refresh();
    } catch (error: unknown) {
      setError(authErrorMessage(error));
      setIsLoading(false);
    }
  };

  const signUpHref = next ? `/auth/sign-up?next=${encodeURIComponent(next)}` : "/auth/sign-up";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">로그인</CardTitle>
        <CardDescription>이메일과 비밀번호로 내 향 기록에 들어가요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "로그인하는 중…" : "로그인"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            아직 계정이 없나요?{" "}
            <Link href={signUpHref} className="text-foreground underline underline-offset-4">
              가입하기
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
