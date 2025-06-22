// Utilities for formatting data

import type { Member } from "@split-fool/shared";

/**
 * Format a date string for display
 * @param dateString - ISO date string or YYYY-MM-DD format
 * @returns Localized date string
 */
export function formatDate(dateString: string): string {
	// Handle both full ISO dates and YYYY-MM-DD format
	const date = new Date(dateString);

	if (isNaN(date.getTime())) {
		// If invalid date, try parsing YYYY-MM-DD format manually
		const parts = dateString.split("-");
		if (parts.length === 3) {
			const [year, month, day] = parts.map(Number);
			const manualDate = new Date(year, month - 1, day);
			if (!isNaN(manualDate.getTime())) {
				return manualDate.toLocaleDateString();
			}
		}
		// Return original string if parsing fails
		return dateString;
	}

	return date.toLocaleDateString();
}

/**
 * Get a member's name by ID
 * @param memberId - The member's ID
 * @param members - Array of members to search
 * @returns The member's name or "Unknown" if not found
 */
export function getMemberName(memberId: string, members: Member[]): string {
	const member = members.find((m) => m.id === memberId);
	return member?.name || "Unknown";
}

/**
 * Format a currency amount
 * @param amount - The amount to format
 * @param includeSign - Whether to include $ sign (default: true)
 * @returns Formatted amount string
 */
export function formatCurrency(amount: number, includeSign = true): string {
	const formatted = Math.abs(amount).toFixed(2);
	return includeSign ? `$${formatted}` : formatted;
}

/**
 * Get a member's initials for avatar display
 * @param name - The member's name
 * @returns Uppercase initials (first letter of name)
 */
export function getMemberInitials(name: string): string {
	return name.charAt(0).toUpperCase();
}

/**
 * Format a balance with appropriate text
 * @param balance - The balance amount
 * @returns Object with formatted amount and status text
 */
export function formatBalance(balance: number): {
	amount: string;
	status: string;
	isPositive: boolean;
} {
	const amount = formatCurrency(balance);
	let status = "";
	let isPositive = false;

	if (balance > 0) {
		status = "(to receive)";
		isPositive = true;
	} else if (balance < 0) {
		status = "(to pay)";
		isPositive = false;
	}

	return { amount, status, isPositive };
}
