// Common type definitions for the web application

export interface SplitAmount {
	memberId: string;
	amount: number;
}

export interface ValidationResult {
	isValid: boolean;
	error?: string;
}

export type CustomSplits = Record<string, string>;

export interface ExpenseFormState {
	payerId: string;
	amount: string;
	description: string;
	splitType: "equal" | "custom";
	customSplits: CustomSplits;
}

export interface ExpenseFormValidation {
	payerId?: string;
	amount?: string;
	description?: string;
	splits?: string;
}
