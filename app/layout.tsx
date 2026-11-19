import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/toast";

// 웹폰트: 제목 아리따 부리·본문 Pretendard 계열을 오픈 라이선스(OFL) 글꼴로 대체한다.
// fontsource 패키지로 자체 호스팅하고, 한글은 unicode-range 조각으로 필요한 만큼만 받는다.
import "@fontsource-variable/noto-sans-kr";
import "@fontsource/noto-serif-kr/400.css";
import "@fontsource/noto-serif-kr/500.css";
import "@fontsource/noto-serif-kr/600.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "향 아카이브",
  description: "좋아하는 음식에서 나의 향수를 찾아요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Toaster>
          <AppShell>{children}</AppShell>
        </Toaster>
      </body>
    </html>
  );
}
