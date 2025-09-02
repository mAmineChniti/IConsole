"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ghost } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <Card className="border-primary/20 bg-card relative z-20 w-full max-w-3xl rounded-xl border-2 p-10 text-center shadow-xl">
        <div className="mb-2 flex flex-col items-center gap-6">
          <Ghost className="text-primary/80 mb-4 h-16 w-16 animate-bounce" />
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
          className="cursor-pointer px-8 py-2 text-base font-semibold"
        >
          <Link href="/" aria-label="Go back to the home page">
            Take Me Home
          </Link>
        </Button>
      </Card>
    </div>
  );
}
