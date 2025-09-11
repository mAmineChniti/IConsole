"use client";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  type ComboboxProps,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { type MouseEvent } from "react";

export type XComboboxData = {
  label: string;
  value: string;
};

export type XComboboxProps = {
  data: XComboboxData[];
  value?: string;
  onChange?: (value: string | undefined) => void;
  onClear?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  type: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
} & Omit<ComboboxProps, "data" | "value" | "onValueChange" | "type">;

export function XCombobox({
  data,
  value,
  onChange,
  onClear,
  placeholder,
  searchPlaceholder,
  emptyText,
  type,
  className,
  disabled = false,
  clearable = true,
  ...props
}: XComboboxProps) {
  const labelCounts = new Map<string, number>();

  const indexedData = data.map((item, index) => {
    const currentCount = labelCounts.get(item.label) ?? 0;
    labelCounts.set(item.label, currentCount + 1);

    return {
      ...item,
      internalValue: `${item.value}__idx_${index}`,
      originalValue: item.value,
      isDuplicate: currentCount > 0,
      duplicateIndex: currentCount,
    };
  });

  const selectedItem = !value
    ? undefined
    : indexedData.find((item) => item.originalValue === value);

  const handleValueChange = (internalValue: string) => {
    if (!internalValue) {
      onChange?.(undefined);
      return;
    }

    const item = indexedData.find(
      (item) => item.internalValue === internalValue,
    );
    if (item) {
      onChange?.(item.originalValue);
    }
  };

  const handleClear = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange?.(undefined);
    onClear?.();
  };

  return (
    <div className="relative">
      <Combobox
        data={indexedData.map((item) => ({
          label: item.label,
          value: item.internalValue,
        }))}
        type={type}
        value={selectedItem?.internalValue ?? ""}
        onValueChange={handleValueChange}
        {...props}
      >
        <ComboboxTrigger
          className={cn(
            "w-full cursor-pointer justify-between rounded-full",
            disabled && "pointer-events-none opacity-50",
            clearable && selectedItem && "pr-10",
            className,
          )}
          disabled={disabled}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="truncate">
              {selectedItem?.label ?? placeholder ?? `Select ${type}...`}
            </span>
            <ChevronsUpDown className="text-muted-foreground h-4 w-4 shrink-0" />
          </div>
        </ComboboxTrigger>

        <ComboboxContent>
          <ComboboxInput
            placeholder={searchPlaceholder ?? `Search ${type}...`}
          />
          <ComboboxEmpty>{emptyText ?? `No ${type} found.`}</ComboboxEmpty>
          <ComboboxList>
            <ComboboxGroup>
              {indexedData.map((item) => (
                <ComboboxItem
                  key={item.internalValue}
                  value={item.internalValue}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedItem?.internalValue === item.internalValue
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span>{item.label}</span>
                    {item.isDuplicate && (
                      <span className="text-muted-foreground text-xs">
                        #{item.duplicateIndex + 1}
                      </span>
                    )}
                  </div>
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {clearable && selectedItem && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1.5 h-7 w-7 -translate-y-1/2 cursor-pointer rounded-full"
          onClick={handleClear}
          aria-label={`Clear ${type} selection`}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
