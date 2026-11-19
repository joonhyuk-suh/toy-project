import { Suspense } from "react";

import { SignUpForm } from "@/features/auth";

export const metadata = { title: "가입하기 · 향 아카이브" };

export default function SignUpPage() {
  return (
    <div className="mx-auto w-full max-w-sm py-6 sm:py-12">
      <Suspense>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
