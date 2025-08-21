"use client";

import { cn } from "@/lib/utils";
import { Server } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export function GetDistroIcon({ imageName }: { imageName: string }) {
  const [imageErrorIndex, setImageErrorIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setImageErrorIndex(0);
    setLoading(true);
  }, [imageName]);

  const name = (imageName ?? "").toLowerCase();
  const words = name.match(/[a-z0-9]+/gi) ?? [];
  const candidates = [
    ...words.filter((w) => w === "windows"),
    ...words.filter((w) => w !== "windows"),
  ];
  if (candidates.length === 0) candidates.push("unknown");

  if (imageErrorIndex >= candidates.length) {
    return (
      <div className={cn("relative flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8")}>
        {" "}
        <Server
          className={cn("w-full h-full flex-shrink-0", "text-muted-foreground")}
          aria-hidden="true"
        />{" "}
      </div>
    );
  }

  const candidate = candidates[imageErrorIndex]!;
  const sizeClasses = cn("w-6 h-6 sm:w-8 sm:h-8");

  if (candidate === "windows") {
    const src =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Windows_logo_-_2012.svg/32px-Windows_logo_-_2012.svg.png";

    return (
      <div className={cn("relative flex-shrink-0", sizeClasses)}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center w-full h-full">
            <Server
              className={cn(
                "w-full h-full flex-shrink-0",
                "text-muted-foreground",
              )}
              aria-hidden="true"
            />
          </div>
        )}
        <Image
          key={`${candidate}-${imageErrorIndex}-${imageName}`}
          src={src}
          alt="Windows"
          width={32}
          height={32}
          className={cn(sizeClasses, "object-contain w-full h-full")}
          onError={() => {
            setImageErrorIndex((i) => i + 1);
            setLoading(true);
          }}
          onLoadingComplete={() => setLoading(false)}
        />
      </div>
    );
  }

  const baseLogoUrl =
    "https://raw.githubusercontent.com/lutgaru/linux-distro-logos/master";
  const logoWord = candidate ?? "unknown";
  const logoUrl = `${baseLogoUrl}/${logoWord}.png`;

  return (
    <div className={cn("relative flex-shrink-0", sizeClasses)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center w-full h-full">
          <Server
            className={cn("w-full h-full flex-shrink-0 text-muted-foreground")}
            aria-hidden="true"
          />
        </div>
      )}
      <Image
        key={`${logoWord}-${imageErrorIndex}-${imageName}`}
        src={logoUrl}
        alt={`${logoWord.charAt(0).toUpperCase() + logoWord.slice(1)} Logo`}
        width={32}
        height={32}
        className={cn(sizeClasses, "object-contain w-full h-full")}
        onError={() => {
          setImageErrorIndex((i) => i + 1);
          setLoading(true);
        }}
        onLoadingComplete={() => setLoading(false)}
      />
    </div>
  );
}
