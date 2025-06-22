// Utilities for member management

import type { Member } from "@split-fool/shared";
import type { ValidationResult } from "../types";

/**
 * Check if a member name already exists (case-insensitive)
 * @param name - The name to check
 * @param members - Array of existing members
 * @returns True if the name already exists
 */
export function isDuplicateMemberName(
	name: string,
	members: Member[],
): boolean {
	const trimmedName = name.trim().toLowerCase();
	return members.some((member) => member.name.toLowerCase() === trimmedName);
}

/**
 * Validate a member name
 * @param name - The name to validate
 * @returns Validation result
 */
export function validateMemberName(name: string): ValidationResult {
	const trimmedName = name.trim();

	if (!trimmedName) {
		return { isValid: false, error: "Member name is required" };
	}

	if (trimmedName.length < 1) {
		return {
			isValid: false,
			error: "Member name must be at least 1 character",
		};
	}

	if (trimmedName.length > 50) {
		return {
			isValid: false,
			error: "Member name must be less than 50 characters",
		};
	}

	return { isValid: true };
}

/**
 * Validate if a member can be deleted
 * @param memberId - The member ID to check
 * @param members - Array of all members
 * @returns Validation result
 */
export function canDeleteMember(
	memberId: string,
	members: Member[],
): ValidationResult {
	// In a real app, you might also check if they have expenses
	if (members.length <= 1) {
		return {
			isValid: false,
			error: "Cannot delete the last member in the group",
		};
	}

	const memberExists = members.some((m) => m.id === memberId);
	if (!memberExists) {
		return {
			isValid: false,
			error: "Member not found",
		};
	}

	return { isValid: true };
}

/**
 * Sort members alphabetically by name
 * @param members - Array of members to sort
 * @returns Sorted array of members
 */
export function sortMembersByName(members: Member[]): Member[] {
	return [...members].sort((a, b) =>
		a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
	);
}

/**
 * Get a unique member name suggestion if duplicate exists
 * @param baseName - The base name to make unique
 * @param members - Array of existing members
 * @returns A unique name suggestion
 */
export function getUniqueMemberName(
	baseName: string,
	members: Member[],
): string {
	let name = baseName.trim();
	let counter = 1;

	while (isDuplicateMemberName(name, members)) {
		counter++;
		name = `${baseName.trim()} ${counter}`;
	}

	return name;
}
