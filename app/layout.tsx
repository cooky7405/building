import type React from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import NavBar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "빌딩 관리 시스템",
  description: "효율적인 빌딩 관리를 위한 웹 애플리케이션",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <ThemeProvider attribute="class" defaultTheme="light">
          <NavBar />
          <div className="pb-16">{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
