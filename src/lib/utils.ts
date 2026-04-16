import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

const riskColors: Record<string, string> = {
	critical: 'var(--color-critical)',
	high: 'var(--color-high)',
	medium: 'var(--color-medium)',
	low: 'var(--color-low)'
};

export function riskLevelColor(level: string): string {
	return riskColors[level] ?? 'var(--color-low)';
}

export function scoreToRiskLevel(score: number): string {
	if (score <= 3) return 'low';
	if (score <= 6) return 'medium';
	if (score <= 8) return 'high';
	return 'critical';
}
