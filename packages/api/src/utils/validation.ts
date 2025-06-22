/**
 * Business logic validation utilities
 */

/**
 * Validate expense date is not in the future
 */
export function validateExpenseDate(date: string): boolean {
	const expenseDate = new Date(date);
	const today = new Date();
	today.setHours(23, 59, 59, 999); // End of today
	return expenseDate <= today;
}

/**
 * Validate expense date format (YYYY-MM-DD)
 */
export function isValidDateFormat(date: string): boolean {
	const regex = /^\d{4}-\d{2}-\d{2}$/;
	if (!regex.test(date)) return false;

	const parts = date.split("-");
	const year = parseInt(parts[0], 10);
	const month = parseInt(parts[1], 10);
	const day = parseInt(parts[2], 10);

	// Check if date is valid
	const dateObj = new Date(year, month - 1, day);
	return (
		dateObj.getFullYear() === year &&
		dateObj.getMonth() === month - 1 &&
		dateObj.getDate() === day
	);
}

/**
 * Format amount to 2 decimal places
 */
export function formatAmount(amount: number): number {
	return Math.round(amount * 100) / 100;
}

/**
 * Validate member can be deleted (no expenses)
 */
export function canDeleteMember(
	memberId: string,
	expenses: Array<{ payerId: string }>,
	splits: Array<{ memberId: string }>,
): { canDelete: boolean; reason?: string } {
	// Check if member is payer for any expense
	const isPayer = expenses.some((e) => e.payerId === memberId);
	if (isPayer) {
		return {
			canDelete: false,
			reason: "Member has paid for expenses",
		};
	}

	// Check if member has any splits
	const hasSplits = splits.some((s) => s.memberId === memberId);
	if (hasSplits) {
		return {
			canDelete: false,
			reason: "Member is part of expense splits",
		};
	}

	return { canDelete: true };
}

/**
 * Validate group code format
 */
export function isValidGroupCode(code: string): boolean {
	// Must be 6 characters, alphanumeric uppercase only
	return /^[A-Z0-9]{6}$/.test(code);
}

/**
 * Calculate days until group expires (30 days from creation)
 */
export function daysUntilExpiry(createdAt: string): number {
	const created = new Date(createdAt);
	const expiry = new Date(created);
	expiry.setDate(expiry.getDate() + 30);

	const now = new Date();
	const diffMs = expiry.getTime() - now.getTime();
	const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	return Math.max(0, diffDays);
}

/**
 * Check if group has expired
 */
export function isGroupExpired(createdAt: string): boolean {
	return daysUntilExpiry(createdAt) === 0;
}
