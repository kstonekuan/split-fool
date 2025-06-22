import { describe, expect, it } from "vitest";
import {
	formatGroupCode,
	validateGroupCode,
	validateGroupName,
} from "./validation";

describe("Validation Utils", () => {
	describe("validateGroupCode", () => {
		it("should accept valid 6-character codes", () => {
			const result = validateGroupCode("ABC123");
			expect(result.isValid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it("should reject empty codes", () => {
			const result = validateGroupCode("");
			expect(result.isValid).toBe(false);
			expect(result.error).toBe("Group code is required");
		});

		it("should reject codes shorter than 6 characters", () => {
			const result = validateGroupCode("ABC");
			expect(result.isValid).toBe(false);
			expect(result.error).toBe("Group code must be 6 characters");
		});

		it("should reject codes longer than 6 characters", () => {
			const result = validateGroupCode("ABCDEFG");
			expect(result.isValid).toBe(false);
			expect(result.error).toBe("Group code must be 6 characters");
		});

		it("should accept codes with lowercase letters", () => {
			const result = validateGroupCode("abc123");
			expect(result.isValid).toBe(true);
		});
	});

	describe("validateGroupName", () => {
		it("should accept valid group names", () => {
			const result = validateGroupName("My Group");
			expect(result.isValid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it("should reject empty names", () => {
			const result = validateGroupName("");
			expect(result.isValid).toBe(false);
			expect(result.error).toBe("Group name is required");
		});

		it("should reject names that are too long", () => {
			const longName = "a".repeat(101);
			const result = validateGroupName(longName);
			expect(result.isValid).toBe(false);
			expect(result.error).toBe("Group name must be less than 100 characters");
		});

		it("should trim whitespace", () => {
			const result = validateGroupName("  My Group  ");
			expect(result.isValid).toBe(true);
		});
	});

	describe("formatGroupCode", () => {
		it("should convert lowercase to uppercase", () => {
			expect(formatGroupCode("abc123")).toBe("ABC123");
		});

		it("should preserve uppercase", () => {
			expect(formatGroupCode("ABC123")).toBe("ABC123");
		});

		it("should handle mixed case", () => {
			expect(formatGroupCode("AbC123")).toBe("ABC123");
		});
	});
});
