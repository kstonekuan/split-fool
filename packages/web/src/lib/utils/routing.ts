// Utilities for routing and URL handling

/**
 * Extracts a group code from a URL path
 * @param path - The URL path (e.g., "/ABC123")
 * @returns The group code in uppercase, or null if invalid
 */
export function extractGroupCodeFromPath(path: string): string | null {
	// Remove leading slash if present
	const cleanPath = path.startsWith("/") ? path.slice(1) : path;

	// Check if it's a valid 6-character group code
	if (cleanPath && cleanPath.length === 6) {
		return cleanPath.toUpperCase();
	}

	return null;
}

/**
 * Validates if a string is a valid group code
 * @param code - The code to validate
 * @returns True if the code is valid (6 characters)
 */
export function isValidGroupCode(code: string): boolean {
	return code.length === 6;
}

/**
 * Redirects to the home page with an optional delay
 * @param delay - Delay in milliseconds before redirecting (default: 0)
 */
export function redirectToHome(delay = 0): void {
	if (delay > 0) {
		setTimeout(() => {
			window.location.href = "/";
		}, delay);
	} else {
		window.location.href = "/";
	}
}

/**
 * Navigates to a group page
 * @param groupCode - The group code to navigate to
 */
export function navigateToGroup(groupCode: string): void {
	window.location.href = `/${groupCode.toUpperCase()}`;
}

/**
 * Gets the current group code from the URL
 * @returns The current group code or null
 */
export function getCurrentGroupCode(): string | null {
	return extractGroupCodeFromPath(window.location.pathname);
}
