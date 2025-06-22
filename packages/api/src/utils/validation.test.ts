import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	canDeleteMember,
	daysUntilExpiry,
	formatAmount,
	isGroupExpired,
	isValidDateFormat,
	isValidGroupCode,
	validateExpenseDate,
} from "./validation";

describe("validateExpenseDate", () => {
	beforeEach(() => {
		// Mock date to ensure consistent testing
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should accept today's date", () => {
		expect(validateExpenseDate("2024-03-15")).toBe(true);
	});

	it("should accept past dates", () => {
		expect(validateExpenseDate("2024-03-01")).toBe(true);
		expect(validateExpenseDate("2023-12-31")).toBe(true);
	});

	it("should reject future dates", () => {
		expect(validateExpenseDate("2024-03-16")).toBe(false);
		expect(validateExpenseDate("2025-01-01")).toBe(false);
	});

	it("should handle end of day correctly", () => {
		// Even at 23:59:59, today's date should be valid
		vi.setSystemTime(new Date("2024-03-15T23:59:59Z"));
		expect(validateExpenseDate("2024-03-15")).toBe(true);
	});
});

describe("isValidDateFormat", () => {
	it("should accept valid date formats", () => {
		expect(isValidDateFormat("2024-03-15")).toBe(true);
		expect(isValidDateFormat("2000-01-01")).toBe(true);
		expect(isValidDateFormat("2099-12-31")).toBe(true);
	});

	it("should reject invalid formats", () => {
		expect(isValidDateFormat("2024-3-15")).toBe(false); // Missing leading zeros
		expect(isValidDateFormat("2024/03/15")).toBe(false); // Wrong separator
		expect(isValidDateFormat("15-03-2024")).toBe(false); // Wrong order
		expect(isValidDateFormat("2024-13-01")).toBe(false); // Invalid month
		expect(isValidDateFormat("2024-02-30")).toBe(false); // Invalid day for February
		expect(isValidDateFormat("not-a-date")).toBe(false);
	});

	it("should validate leap year dates", () => {
		expect(isValidDateFormat("2024-02-29")).toBe(true); // 2024 is a leap year
		expect(isValidDateFormat("2023-02-29")).toBe(false); // 2023 is not a leap year
	});
});

describe("formatAmount", () => {
	it("should format amounts to 2 decimal places", () => {
		expect(formatAmount(10)).toBe(10);
		expect(formatAmount(10.1)).toBe(10.1);
		expect(formatAmount(10.12)).toBe(10.12);
		expect(formatAmount(10.123)).toBe(10.12);
		expect(formatAmount(10.127)).toBe(10.13);
	});

	it("should handle edge cases", () => {
		expect(formatAmount(0)).toBe(0);
		expect(formatAmount(0.001)).toBe(0);
		expect(formatAmount(0.005)).toBe(0.01);
		expect(formatAmount(99.999)).toBe(100);
	});
});

describe("canDeleteMember", () => {
	it("should allow deletion when member has no expenses or splits", () => {
		const result = canDeleteMember("member1", [], []);
		expect(result).toEqual({ canDelete: true });
	});

	it("should prevent deletion when member is a payer", () => {
		const expenses = [{ payerId: "member1" }, { payerId: "member2" }];
		const result = canDeleteMember("member1", expenses, []);
		expect(result).toEqual({
			canDelete: false,
			reason: "Member has paid for expenses",
		});
	});

	it("should prevent deletion when member has splits", () => {
		const splits = [{ memberId: "member1" }, { memberId: "member2" }];
		const result = canDeleteMember("member1", [], splits);
		expect(result).toEqual({
			canDelete: false,
			reason: "Member is part of expense splits",
		});
	});

	it("should check payer before splits", () => {
		const expenses = [{ payerId: "member1" }];
		const splits = [{ memberId: "member1" }];
		const result = canDeleteMember("member1", expenses, splits);
		expect(result.reason).toBe("Member has paid for expenses");
	});
});

describe("isValidGroupCode", () => {
	it("should accept valid group codes", () => {
		expect(isValidGroupCode("ABC123")).toBe(true);
		expect(isValidGroupCode("000000")).toBe(true);
		expect(isValidGroupCode("ZZZZZZ")).toBe(true);
		expect(isValidGroupCode("A1B2C3")).toBe(true);
	});

	it("should reject invalid group codes", () => {
		expect(isValidGroupCode("abc123")).toBe(false); // Lowercase
		expect(isValidGroupCode("ABC12")).toBe(false); // Too short
		expect(isValidGroupCode("ABC1234")).toBe(false); // Too long
		expect(isValidGroupCode("ABC-23")).toBe(false); // Special character
		expect(isValidGroupCode("ABC 23")).toBe(false); // Space
		expect(isValidGroupCode("")).toBe(false); // Empty
	});
});

describe("daysUntilExpiry", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should calculate days correctly", () => {
		// Created today
		expect(daysUntilExpiry("2024-03-15T12:00:00Z")).toBe(30);

		// Created 10 days ago
		expect(daysUntilExpiry("2024-03-05T12:00:00Z")).toBe(20);

		// Created 29 days ago
		expect(daysUntilExpiry("2024-02-15T12:00:00Z")).toBe(1);
	});

	it("should return 0 for expired groups", () => {
		// Created 30 days ago
		expect(daysUntilExpiry("2024-02-14T12:00:00Z")).toBe(0);

		// Created 40 days ago
		expect(daysUntilExpiry("2024-02-04T12:00:00Z")).toBe(0);
	});

	it("should round up partial days", () => {
		// If group expires in 1.5 days, should show 2 days
		const now = new Date("2024-03-15T12:00:00Z");
		vi.setSystemTime(now);

		// Created 28.5 days ago
		const created = new Date(now);
		created.setDate(created.getDate() - 28);
		created.setHours(created.getHours() - 12);

		const daysLeft = daysUntilExpiry(created.toISOString());
		expect(daysLeft).toBeGreaterThan(0);
		expect(daysLeft).toBeLessThanOrEqual(2);
	});
});

describe("isGroupExpired", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2024-03-15T12:00:00Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should identify expired groups", () => {
		expect(isGroupExpired("2024-02-14T12:00:00Z")).toBe(true); // 30 days ago
		expect(isGroupExpired("2024-01-01T12:00:00Z")).toBe(true); // Much older
	});

	it("should identify non-expired groups", () => {
		expect(isGroupExpired("2024-03-15T12:00:00Z")).toBe(false); // Today
		expect(isGroupExpired("2024-03-01T12:00:00Z")).toBe(false); // 14 days ago
		expect(isGroupExpired("2024-02-15T12:00:00Z")).toBe(false); // 29 days ago
	});
});
