import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import { StyledComponentsRegistry } from "@/shared/lib/styled-components-registry";
import { QueryProvider } from "@/shared/api/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description:
    "Next.js, TypeScript, styled-components, TanStack Query 기반 관리자 대시보드",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${nunitoSans.variable}`}
    >
      <body>
        <StyledComponentsRegistry>
          <QueryProvider>{children}</QueryProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
