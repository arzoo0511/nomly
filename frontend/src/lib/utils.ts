import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const currencyFormatterPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatPrice(amount: number, precise = false): string {
  return precise ? currencyFormatterPrecise.format(amount) : currencyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const dateFormatterWithYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const monthYearFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(value: string, withYear = false): string {
  const date = parseDateOnly(value);
  return withYear ? dateFormatterWithYear.format(date) : dateFormatter.format(date);
}

export function formatDateRange(checkIn: string, checkOut: string): string {
  return `${formatDate(checkIn)} - ${formatDate(checkOut, true)}`;
}

export function formatMonthYear(date: Date): string {
  return monthYearFormatter.format(date);
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}
