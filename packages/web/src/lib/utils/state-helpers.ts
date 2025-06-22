// Utilities for state management

import type { Member } from "@split-fool/shared";
import type { CustomSplits, ExpenseFormState } from "../types";

/**
 * Initialize custom splits for all members with empty values
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

/**
 * Create a default expense form state
 * @returns Default expense form state
 */
export function createDefaultExpenseFormState(): ExpenseFormState {
	return {
		payerId: "",
		amount: "",
		description: "",
		splitType: "equal",
		customSplits: {},
	};
}

/**
 * Reset expense form to default state
 * @returns Reset expense form state
 */
export function resetExpenseForm(): ExpenseFormState {
	return createDefaultExpenseFormState();
}

/**
 * Update custom splits when members change
 * @param currentSplits - Current custom splits
 * @param members - Updated list of members
 * @returns Updated custom splits
 */
export function updateCustomSplitsForMembers(
	currentSplits: CustomSplits,
	members: Member[],
): CustomSplits {
	const updatedSplits: CustomSplits = {};

	// Add all current members
	for (const member of members) {
		// Preserve existing value if member already existed
		updatedSplits[member.id] = currentSplits[member.id] || "";
	}

	return updatedSplits;
}

/**
 * Check if expense form has any data entered
 * @param formState - The expense form state
 * @returns True if form has data
 */
export function hasExpenseFormData(formState: ExpenseFormState): boolean {
	return (
		formState.payerId !== "" ||
		formState.amount !== "" ||
		formState.description !== "" ||
		Object.values(formState.customSplits).some((value) => value !== "")
	);
}

/**
 * Create a confirmation message for form data loss
 * @param formType - Type of form (e.g., "expense", "member")
 * @returns Confirmation message
 */
export function createFormDataLossMessage(formType: string): string {
	return `You have unsaved ${formType} data. Are you sure you want to leave?`;
}
