// Common validation utilities

import type { ValidationResult } from "../types";

/**
 * Validate a group name
 * @param name - The group name to validate
 * @returns Validation result
 */
export function validateGroupName(name: string): ValidationResult {
	const trimmedName = name.trim();

	if (!trimmedName) {
		return { isValid: false, error: "Group name is required" };
	}

	if (trimmedName.length < 1) {
		return { isValid: false, error: "Group name must be at least 1 character" };
	}

	if (trimmedName.length > 100) {
		return {
			isValid: false,
			error: "Group name must be less than 100 characters",
		};
	}

	return { isValid: true };
}

/**
 * Validate a group code
 * @param code - The group code to validate
 * @returns Validation result
 */
export function validateGroupCode(code: string): ValidationResult {
	const trimmedCode = code.trim();

	if (!trimmedCode) {
		return { isValid: false, error: "Group code is required" };
	}

	if (trimmedCode.length !== 6) {
		return { isValid: false, error: "Group code must be 6 characters" };
	}

	// Check if it contains only alphanumeric characters
	if (!/^[A-Z0-9]{6}$/i.test(trimmedCode)) {
		return {
			isValid: false,
			error: "Group code must contain only letters and numbers",
		};
	}

	return { isValid: true };
}

/**
 * Format a group code to uppercase
 * @param code - The code to format
 * @returns Formatted code
 */
export function formatGroupCode(code: string): string {
	return code.toUpperCase().trim();
}

/**
 * Validate a currency amount
 * @param amount - The amount as a string
 * @returns Validation result
 */
export function validateAmount(amount: string): ValidationResult {
	if (!amount || amount.trim() === "") {
		return { isValid: false, error: "Amount is required" };
	}

	const parsedAmount = parseFloat(amount);

	if (isNaN(parsedAmount)) {
		return { isValid: false, error: "Amount must be a valid number" };
	}

	if (parsedAmount <= 0) {
		return { isValid: false, error: "Amount must be greater than 0" };
	}

	// Check for reasonable maximum (e.g., $1 million)
	if (parsedAmount > 1000000) {
		return { isValid: false, error: "Amount seems too large" };
	}

	// Check decimal places (max 2 for currency)
	const decimalPlaces = (amount.split(".")[1] || "").length;
	if (decimalPlaces > 2) {
		return {
			isValid: false,
			error: "Amount can have at most 2 decimal places",
		};
	}

	return { isValid: true };
}

/**
 * Validate a text input (generic)
 * @param text - The text to validate
 * @param fieldName - Name of the field for error messages
 * @param options - Validation options
 * @returns Validation result
 */
export function validateTextField(
	text: string,
	fieldName: string,
	options: {
		required?: boolean;
		minLength?: number;
		maxLength?: number;
	} = {},
): ValidationResult {
	const { required = true, minLength = 0, maxLength = 255 } = options;
	const trimmedText = text.trim();

	if (required && !trimmedText) {
		return { isValid: false, error: `${fieldName} is required` };
	}

	if (trimmedText.length < minLength) {
		return {
			isValid: false,
			error: `${fieldName} must be at least ${minLength} characters`,
		};
	}

	if (trimmedText.length > maxLength) {
		return {
			isValid: false,
			error: `${fieldName} must be less than ${maxLength} characters`,
		};
	}

	return { isValid: true };
}
