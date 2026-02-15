import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `₹${num.toFixed(2)}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function generateUID(): string {
  return "UID" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

export function generateOrderId(): string {
  return "ORDER" + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function calculatePrice(quantity: number, rate: number): number {
  return (quantity / 1000) * rate;
}

export function calculateQuantity(price: number, rate: number): number {
  return Math.round((price / rate) * 1000);
}
