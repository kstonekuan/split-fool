import { describe, expect, it, vi } from "vitest";
import {
	generateGroupCode,
	generateUniqueGroupCode,
	isMemorableCode,
} from "./group-code";

describe("generateGroupCode", () => {
	it("should generate 6-character codes", () => {
		for (let i = 0; i < 10; i++) {
			const code = generateGroupCode();
			expect(code).toHaveLength(6);
		}
	});

	it("should only use allowed characters", () => {
		const allowedChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
		for (let i = 0; i < 10; i++) {
			const code = generateGroupCode();
			expect(code).toMatch(allowedChars);
		}
	});

	it("should not include confusing characters", () => {
		const confusingChars = /[O0I1]/;
		for (let i = 0; i < 20; i++) {
			const code = generateGroupCode();
			expect(code).not.toMatch(confusingChars);
		}
	});

	it("should generate different codes", () => {
		const codes = new Set();
		for (let i = 0; i < 100; i++) {
			codes.add(generateGroupCode());
		}
		// Should generate mostly unique codes
		expect(codes.size).toBeGreaterThan(95);
	});
});

describe("isMemorableCode", () => {
	it("should detect repeated characters", () => {
		expect(isMemorableCode("AAA123")).toBe(true);
		expect(isMemorableCode("ABCCCC")).toBe(true);
		expect(isMemorableCode("123BBB")).toBe(true);
	});

	it("should detect simple patterns", () => {
		expect(isMemorableCode("AAAAAA")).toBe(true); // All same
		expect(isMemorableCode("ABABAB")).toBe(true); // Alternating
		expect(isMemorableCode("ABCABC")).toBe(true); // Repeating trio
	});

	it("should detect sequential codes", () => {
		expect(isMemorableCode("ABC123")).toBe(true);
		expect(isMemorableCode("XYZ789")).toBe(true);
		expect(isMemorableCode("CBA321")).toBe(true); // Descending
		expect(isMemorableCode("234567")).toBe(true);
	});

	it("should accept non-memorable codes", () => {
		expect(isMemorableCode("A2B9X4")).toBe(false);
		expect(isMemorableCode("QW3RT5")).toBe(false);
		expect(isMemorableCode("MN8PQ2")).toBe(false);
	});

	it("should handle edge cases", () => {
		expect(isMemorableCode("AABBCC")).toBe(false); // Only 2 repeats
		expect(isMemorableCode("A1B2C3")).toBe(false); // Not sequential enough
	});
});

describe("generateUniqueGroupCode", () => {
	it("should generate code on first try if not taken", () => {
		const isCodeTaken = () => false;
		const code = generateUniqueGroupCode(isCodeTaken);
		expect(code).toBeTruthy();
		expect(code).toHaveLength(6);
	});

	it("should retry when codes are taken", () => {
		let attempts = 0;
		const isCodeTaken = () => {
			attempts++;
			return attempts < 3; // First 2 attempts fail
		};

		const code = generateUniqueGroupCode(isCodeTaken);
		expect(code).toBeTruthy();
		expect(attempts).toBe(3);
	});

	it("should return null after max attempts", () => {
		const isCodeTaken = () => true; // Always taken
		const code = generateUniqueGroupCode(isCodeTaken, 5);
		expect(code).toBeNull();
	});

	it("should respect custom max attempts", () => {
		let attempts = 0;
		const isCodeTaken = () => {
			attempts++;
			return true;
		};

		generateUniqueGroupCode(isCodeTaken, 3);
		expect(attempts).toBe(3);
	});
});
