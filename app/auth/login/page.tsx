import { Suspense } from "react";

import { LoginForm } from "@/features/auth";

export const metadata = { title: "로그인 · 향 아카이브" };

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-sm py-6 sm:py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
