// Utilities for expense calculations and split logic

import type { Member } from "@split-fool/shared";
import type { CustomSplits, SplitAmount, ValidationResult } from "../types";

/**
 * Calculate equal splits for an expense
 * @param totalAmount - The total amount to split
 * @param memberCount - Number of members to split between
 * @returns Array of split amounts
 */
export function calculateEqualSplits(
	totalAmount: number,
	memberCount: number,
): SplitAmount[] {
	if (memberCount === 0) {
		return [];
	}

	const splitAmount = totalAmount / memberCount;
	// Round to 2 decimal places
	const roundedSplitAmount = Math.round(splitAmount * 100) / 100;

	// This is handled by the API, but we'll return the simple split
	return Array(memberCount).fill({ amount: roundedSplitAmount });
}

/**
 * Calculate equal splits with member IDs
 * @param totalAmount - The total amount to split
 * @param members - Array of members
 * @returns Array of split amounts with member IDs
 */
export function calculateEqualSplitsWithMembers(
	totalAmount: number,
	members: Member[],
): SplitAmount[] {
	const splitAmount = totalAmount / members.length;
	return members.map((member) => ({
		memberId: member.id,
		amount: Math.round(splitAmount * 100) / 100,
	}));
}

/**
 * Calculate random splits with member IDs
 * @param totalAmount - The total amount to split
 * @param members - Array of members
 * @returns Array of split amounts with member IDs
 */
export function calculateRandomSplitsWithMembers(
	totalAmount: number,
	members: Member[],
): SplitAmount[] {
	if (members.length === 0) return [];
	if (members.length === 1) {
		return [{ memberId: members[0].id, amount: totalAmount }];
	}

	// Generate random weights for each member
	const weights = members.map(() => Math.random());
	const totalWeight = weights.reduce((sum, w) => sum + w, 0);

	// Calculate splits based on weights
	const splits = members.map((member, index) => {
		const share = (weights[index] / totalWeight) * totalAmount;
		return {
			memberId: member.id,
			amount: Math.round(share * 100) / 100,
		};
	});

	// Adjust for rounding differences
	const currentTotal = splits.reduce((sum, s) => sum + s.amount, 0);
	const difference = Math.round((totalAmount - currentTotal) * 100) / 100;

	if (difference !== 0) {
		// Add the difference to the largest split
		const maxIndex = splits.reduce(
			(maxIdx, split, idx, arr) =>
				split.amount > arr[maxIdx].amount ? idx : maxIdx,
			0,
		);
		splits[maxIndex].amount =
			Math.round((splits[maxIndex].amount + difference) * 100) / 100;
	}

	return splits;
}

/**
 * Parse custom split amounts from string inputs
 * @param customSplits - Object with member IDs as keys and amount strings as values
 * @returns Array of split amounts
 */
export function parseSplitAmounts(customSplits: CustomSplits): SplitAmount[] {
	const splits: SplitAmount[] = [];

	for (const [memberId, splitAmount] of Object.entries(customSplits)) {
		const parsedAmount = parseFloat(splitAmount) || 0;
		if (parsedAmount > 0) {
			splits.push({
				memberId,
				amount: parsedAmount,
			});
		}
	}

	return splits;
}

/**
 * Validate custom splits sum to the total amount
 * @param customSplits - Object with member IDs as keys and amount strings as values
 * @param totalAmount - The total expense amount
 * @returns Validation result
 */
export function validateCustomSplits(
	customSplits: CustomSplits,
	totalAmount: number,
): ValidationResult {
	const splits = parseSplitAmounts(customSplits);
	const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);

	// Allow for small floating point differences (1 cent)
	if (Math.abs(totalSplit - totalAmount) > 0.01) {
		return {
			isValid: false,
			error: `Splits must sum to ${totalAmount.toFixed(2)} (currently: ${totalSplit.toFixed(2)})`,
		};
	}

	if (splits.length === 0) {
		return {
			isValid: false,
			error: "At least one member must have a split amount",
		};
	}

	return { isValid: true };
}

/**
 * Validate expense form inputs
 * @param payerId - The ID of the member who paid
 * @param amount - The expense amount as a string
 * @param description - The expense description
 * @returns Validation result
 */
export function validateExpenseForm(
	payerId: string,
	amount: string,
	description: string,
): ValidationResult {
	if (!payerId) {
		return { isValid: false, error: "Please select who paid" };
	}

	const parsedAmount = parseFloat(amount);
	if (!amount || parsedAmount <= 0 || isNaN(parsedAmount)) {
		return { isValid: false, error: "Please enter a valid amount" };
	}

	if (!description.trim()) {
		return { isValid: false, error: "Please enter a description" };
	}

	return { isValid: true };
}

/**
 * Initialize custom splits for all members
 * @param members - Array of members
 * @returns Object with member IDs as keys and empty strings as values
 */
export function initializeCustomSplits(members: Member[]): CustomSplits {
	const splits: CustomSplits = {};
	for (const member of members) {
		splits[member.id] = "";
	}
	return splits;
}
