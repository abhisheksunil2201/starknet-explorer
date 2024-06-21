import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenHash(hash: string) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export const convertAge = (age: number) => {
  return formatDistanceToNow(new Date(age * 1000), { addSuffix: true });
};

export const formatTimeStamp = (date: number) => {
  return format(new Date(date * 1000), "EEE MMM dd yyyy HH:mm:ss xxx (OOOO)");
};
