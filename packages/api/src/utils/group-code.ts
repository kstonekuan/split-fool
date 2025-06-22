/**
 * Group code generation utilities
 */

/**
 * Generate a random group code
 * Uses a reduced character set to avoid confusion (no O/0, I/1, etc.)
 */
export function generateGroupCode(): string {
	// Reduced character set for better readability
	const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No O/0, I/1
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return code;
}

/**
 * Check if a code is easily memorable (has patterns)
 */
export function isMemorableCode(code: string): boolean {
	// Check for repeated characters (e.g., "AAA123", "ABABAB")
	const hasRepeats = /(.)\1{2,}/.test(code); // 3+ same characters in a row

	// Check for simple patterns
	const hasPattern =
		/^(.)\1*$/.test(code) || // All same character
		/^(.)(.)\1\2\1\2$/.test(code) || // ABABAB pattern
		/^(.)(.)(.)\1\2\3$/.test(code); // ABCABC pattern

	// Check if it's sequential
	const isSequential = isSequentialCode(code);

	return hasRepeats || hasPattern || isSequential;
}

/**
 * Check if code contains sequential characters
 */
function isSequentialCode(code: string): boolean {
	for (let i = 0; i < code.length - 2; i++) {
		const char1 = code.charCodeAt(i);
		const char2 = code.charCodeAt(i + 1);
		const char3 = code.charCodeAt(i + 2);

		// Check for ascending or descending sequence
		if (
			(char2 === char1 + 1 && char3 === char2 + 1) ||
			(char2 === char1 - 1 && char3 === char2 - 1)
		) {
			return true;
		}
	}
	return false;
}

/**
 * Generate a group code with retry logic for uniqueness
 */
export function generateUniqueGroupCode(
	isCodeTaken: (code: string) => boolean,
	maxAttempts = 10,
): string | null {
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const code = generateGroupCode();
		if (!isCodeTaken(code)) {
			return code;
		}
	}
	return null;
}
