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

/**
 * 이메일·비밀번호 가입. Supabase UI Password-based Auth 블록의 sign-up-form을 고친 것.
 * 이메일 확인이 꺼져 있으면 가입 응답에 세션이 오므로, 로그인과 같은 목적지로 바로 보낸다.
 */
export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const next = useSearchParams().get("next");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (password !== repeatPassword) {
      setError("비밀번호가 서로 달라요.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await createClient().auth.signUp({ email, password });
      if (error) throw error;
      if (data.session) {
        router.push(safeNextPath(next, "/"));
        router.refresh();
        return;
      }
      // 이메일 확인이 켜진 프로젝트에서만 이 경로로 온다.
      setNotice("가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요.");
      setIsLoading(false);
    } catch (error: unknown) {
      setError(authErrorMessage(error));
      setIsLoading(false);
    }
  };

  const loginHref = next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">가입하기</CardTitle>
        <CardDescription>찾은 향과 관심 향수를 계정에 모아 둘 수 있어요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="flex flex-col gap-5">
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
              autoComplete="new-password"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="repeat-password">비밀번호 확인</Label>
            <Input
              id="repeat-password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm text-muted-foreground">
              {notice}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "가입하는 중…" : "가입하기"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            이미 계정이 있나요?{" "}
            <Link href={loginHref} className="text-foreground underline underline-offset-4">
              로그인
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
