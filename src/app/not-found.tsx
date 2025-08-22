"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ghost } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex overflow-hidden relative flex-col justify-center items-center min-h-screen bg-background">
      <Card className="relative z-20 p-10 w-full max-w-3xl text-center rounded-xl border-2 shadow-xl border-primary/20 bg-card">
        <div className="flex flex-col gap-6 items-center mb-2">
          <Ghost className="mb-4 w-16 h-16 animate-bounce text-primary/80" />
          <h1 className="text-7xl font-bold tracking-widest text-gray-400 opacity-70 drop-shadow-lg">
            404
          </h1>
        </div>
        <p className="mb-2 text-xl font-medium text-gray-400 opacity-70">
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
          className="py-2 px-8 text-base font-semibold cursor-pointer"
        >
          <Link href="/" aria-label="Go back to the home page">
            Take Me Home
          </Link>
        </Button>
      </Card>
    </div>
  );
}
