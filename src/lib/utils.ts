import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAge(createdAt: string) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffInMs = now.getTime() - created.getTime();
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  return `${hours} hour${hours !== 1 ? "s" : ""}`;
}

export function parseComposite(val: string): string {
  return val.split(":::")[0] ?? "";
}

export interface DupSafeOption<T> {
  key: string;
  value: string;
  label: string;
  original: T;
}

export function makeDupSafeSelect<T>(
  items: T[],
  getStored: (t: T) => string,
  getLabel: (t: T) => string,
) {
  const labelCounts = items.reduce<Record<string, number>>((acc, it) => {
    const label = getLabel(it);
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  const options: DupSafeOption<T>[] = items.map((item, idx) => {
    const stored = getStored(item);
    const baseLabel = getLabel(item);
    const label =
      (labelCounts[baseLabel] ?? 0) > 1
        ? `${baseLabel} (${idx + 1})`
        : baseLabel;
    return {
      key: `${stored}-${idx}`,
      value: `${stored}:::${idx}`,
      label,
      original: item,
    };
  });

  const toForm = parseComposite;
  const fromForm = (storedValue: string | undefined) => {
    if (!storedValue) return undefined;
    const idx = items.findIndex((it) => getStored(it) === storedValue);
    return idx >= 0 ? `${storedValue}:::${idx}` : undefined;
  };

  return { options, toForm, fromForm } as const;
}

export function parseVolumeSizeGiB(size: string): number {
  if (!size) return 1;
  const m = /(\d+(?:\.\d+)?)/.exec(size);
  const n = m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export function createSearchParams<T extends object>(data: T): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });
  return params;
}

export function countDuplicates<T>(
  items: T[],
  getKey: (item: T) => string,
  item: T,
): number {
  const key = getKey(item);
  return items.filter((i) => getKey(i) === key).length;
}

export function formatWithDuplicateCount<T>(
  label: string,
  items: T[],
  currentItem: T | undefined,
  getKey: (item: T) => string,
): string {
  if (!currentItem) return label;

  const duplicates = countDuplicates(items, getKey, currentItem);
  if (duplicates <= 1) return label;

  const key = getKey(currentItem);
  let seen = 0;
  for (const item of items) {
    if (getKey(item) === key) {
      seen++;
      if (item === currentItem) {
        return `${label} (${seen})`;
      }
    }
  }
  const firstIdx = items.findIndex((it) => getKey(it) === key);
  return `${label} (${firstIdx >= 0 ? firstIdx + 1 : 1})`;
}
