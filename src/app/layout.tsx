import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "JevArena",
  description:
    "Watch two Jev Agents play Snake. Jev is reached only through Vercel AI Gateway.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark font-sans", geistSans.variable, geistMono.variable)}
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
