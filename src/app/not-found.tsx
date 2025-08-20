"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ghost } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden">
      <Card className="relative z-20 p-10 max-w-3xl w-full text-center shadow-xl border-2 border-primary/20 rounded-xl bg-card">
        <div className="flex flex-col items-center gap-6 mb-2">
          <Ghost className="w-16 h-16 text-primary/80 animate-bounce mb-4" />
          <h1 className="text-7xl font-bold text-gray-400 opacity-70 tracking-widest drop-shadow-lg">
            404
          </h1>
        </div>
        <p className="text-xl mb-2 font-medium text-gray-400 opacity-70">
          Oops! This page vanished into thin air.
        </p>
        <p className="mb-4 text-base text-gray-400 opacity-60">
          The page you are looking for doesn&apos;t exist or has been moved.
          <br />
          Let&apos;s get you back on track.
        </p>
        <Button
          asChild
          variant="default"
          size="lg"
          className="px-8 py-2 text-base font-semibold cursor-pointer"
        >
          <Link href="/" aria-label="Go back to the home page">
            Take Me Home
          </Link>
        </Button>
      </Card>
    </div>
  );
}
