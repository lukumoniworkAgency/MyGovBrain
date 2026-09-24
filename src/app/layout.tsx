import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MotionProvider } from "@/components/motion-provider";
import { AuthProvider } from "@/hooks/use-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "GovGuide AI — Clear guidance for public services",
  description:
    "Independent Indian government-services information and guidance platform. Find services, eligibility, documents, and official sources.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <MotionProvider>
          <AuthProvider>{children}</AuthProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
