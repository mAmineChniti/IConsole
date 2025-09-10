"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import type { ComponentProps } from "react";

export function XSearch({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className,
  containerClassName,
  "aria-label": ariaLabel,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  containerClassName?: string;
} & Omit<ComponentProps<typeof Input>, "value" | "onChange">) {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative flex-1", containerClassName)}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("h-10 rounded-full pl-10", className)}
        aria-label={ariaLabel ?? "Search"}
        {...props}
      />
      {value && (
        <Button
          type="button"
          onClick={handleClear}
          className="absolute top-1/2 right-1.5 h-7 w-7 -translate-y-1/2 cursor-pointer rounded-full"
          variant="ghost"
          size="icon"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
