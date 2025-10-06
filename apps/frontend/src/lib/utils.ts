import { Group } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getGroupColor = (groups: Group[], columnKey: string) => {
  const group = groups.find(
    (g) => g.name.toLowerCase() === columnKey.toLowerCase()
  );
  console.log("group", group);
  console.log("groups", groups);
  console.log("columnKey", columnKey);
  return group?.color || '#E0D9D9';
};
