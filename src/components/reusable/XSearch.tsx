"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import * as React from "react";

export type XSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  containerClassName?: string;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange">;

export function XSearch({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className,
  containerClassName,
  "aria-label": ariaLabel,
  ...props
}: XSearchProps) {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative flex-1", containerClassName)}>
      <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
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
          className="absolute right-1.5 top-1/2 w-7 h-7 rounded-full -translate-y-1/2 cursor-pointer"
          variant="ghost"
          size="icon"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
