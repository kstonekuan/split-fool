// Utilities for error handling

/**
 * Extract a user-friendly error message from an unknown error
 * @param error - The error object (can be any type)
 * @returns A string error message
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "string") {
		return error;
	}

	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof error.message === "string"
	) {
		return error.message;
	}

	// Default fallback
	return "An unexpected error occurred";
}

/**
 * Check if an error indicates a "not found" condition
 * @param error - The error to check
 * @returns True if the error indicates something was not found
 */
export function isNotFoundError(error: unknown): boolean {
	const message = getErrorMessage(error).toLowerCase();
	return message.includes("not found") || message.includes("404");
}

/**
 * Check if an error indicates a network/connection issue
 * @param error - The error to check
 * @returns True if the error is network-related
 */
export function isNetworkError(error: unknown): boolean {
	const message = getErrorMessage(error).toLowerCase();
	return (
		message.includes("network") ||
		message.includes("fetch") ||
		message.includes("connection") ||
		message.includes("offline")
	);
}

/**
 * Check if an error indicates a validation issue
 * @param error - The error to check
 * @returns True if the error is validation-related
 */
export function isValidationError(error: unknown): boolean {
	const message = getErrorMessage(error).toLowerCase();
	return (
		message.includes("invalid") ||
		message.includes("required") ||
		message.includes("must be") ||
		message.includes("validation")
	);
}

/**
 * Format an error for display with optional fallback
 * @param error - The error to format
 * @param fallbackMessage - Optional fallback message
 * @returns Formatted error message
 */
export function formatErrorForDisplay(
	error: unknown,
	fallbackMessage = "Something went wrong",
): string {
	const message = getErrorMessage(error);

	// If it's a generic or technical error, use the fallback
	if (
		message.includes("Failed to fetch") ||
		message.includes("NetworkError") ||
		message === "An unexpected error occurred"
	) {
		return fallbackMessage;
	}

	return message;
}

/**
 * Create a user-friendly error message based on the operation
 * @param operation - What operation failed (e.g., "create group", "add expense")
 * @param error - The actual error
 * @returns User-friendly error message
 */
export function createUserErrorMessage(
	operation: string,
	error: unknown,
): string {
	if (isNetworkError(error)) {
		return `Failed to ${operation}. Please check your internet connection.`;
	}

	if (isNotFoundError(error)) {
		return `Failed to ${operation}. The requested item was not found.`;
	}

	if (isValidationError(error)) {
		// Return the actual validation error as it's usually user-friendly
		return getErrorMessage(error);
	}

	// Generic fallback
	return `Failed to ${operation}. Please try again.`;
}
