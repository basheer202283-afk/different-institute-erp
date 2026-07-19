import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-YE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatCurrency(amount: number, currency = "YER"): string {
  return new Intl.NumberFormat("ar-YE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "الآن";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

export const ROLE_LABELS: Record<string, string> = {
  owner: "المالك",
  manager: "مدير المعهد",
  reception: "الاستقبال",
  accountant: "المحاسب",
  trainer: "المدرب",
};

export const ROLE_LABELS_EN: Record<string, string> = {
  owner: "Owner",
  manager: "Institute Manager",
  reception: "Reception",
  accountant: "Accountant",
  trainer: "Trainer",
};

export function canAccess(userRole: string, requiredRoles: string[]): boolean {
  if (userRole === "owner") return true;
  return requiredRoles.includes(userRole);
}
