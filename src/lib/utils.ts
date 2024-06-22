import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  formatDistanceToNow,
  formatDistanceToNowStrict,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenHash(hash: string) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export const convertAge = (age: number, suffix = true) => {
  return formatDistanceToNowStrict(new Date(age * 1000), { addSuffix: suffix });
};

export const formatTimeStamp = (date: number, detailed = true) => {
  if (detailed) {
    return format(new Date(date * 1000), "EEE MMM dd yyyy HH:mm:ss xxx (OOOO)");
  }
  return format(new Date(date * 1000), "EEE MMM dd yyyy  HH:mm:ss");
};

export const formatDate = (timestamp: string) => {
  const date = new Date(Number(timestamp) * 1000);
  return format(date, "MMM dd yyyy");
};

export const formatTime = (timestamp: string) => {
  const date = new Date(Number(timestamp) * 1000);
  return format(date, "HH:mm:ss");
};

export const weiToEther = (wei: number | undefined) => {
  if (!wei) return;

  const weiValue = BigInt(wei);
  const etherValue = Number(weiValue) / 1e18;
  return etherValue;
};

export const toDecimal = (value: string | undefined) => {
  if (!value) return;
  return parseInt(value, 16);
};
