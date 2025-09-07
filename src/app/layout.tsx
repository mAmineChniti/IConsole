import "@/styles/globals.css";
import { Providers } from "@/components/providers";
import { TokenExpiration } from "@/components/TokenExpiration";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "IConsole",
  description: "Infrastructure Console",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground h-full antialiased">
        <TokenExpiration />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
