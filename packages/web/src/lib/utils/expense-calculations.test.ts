import type { Member } from "@split-fool/shared";
import { describe, expect, it } from "vitest";
import {
	calculateEqualSplitsWithMembers,
	calculateRandomSplitsWithMembers,
	parseSplitAmounts,
	validateCustomSplits,
	validateExpenseForm,
} from "./expense-calculations";

describe("calculateEqualSplitsWithMembers", () => {
	it("should split equally among members", () => {
		const members: Member[] = [
			{ id: "1", groupId: "g1", name: "Alice", createdAt: "", updatedAt: "" },
			{ id: "2", groupId: "g1", name: "Bob", createdAt: "", updatedAt: "" },
			{ id: "3", groupId: "g1", name: "Charlie", createdAt: "", updatedAt: "" },
		];

		const splits = calculateEqualSplitsWithMembers(90, members);

		expect(splits).toHaveLength(3);
		expect(splits[0]).toEqual({ memberId: "1", amount: 30 });
		expect(splits[1]).toEqual({ memberId: "2", amount: 30 });
		expect(splits[2]).toEqual({ memberId: "3", amount: 30 });
	});

	it("should handle uneven amounts", () => {
		const members: Member[] = [
			{ id: "1", groupId: "g1", name: "Alice", createdAt: "", updatedAt: "" },
			{ id: "2", groupId: "g1", name: "Bob", createdAt: "", updatedAt: "" },
			{ id: "3", groupId: "g1", name: "Charlie", createdAt: "", updatedAt: "" },
		];

		const splits = calculateEqualSplitsWithMembers(100, members);

		expect(splits).toHaveLength(3);
		// 100/3 = 33.333..., rounded to 33.33
		splits.forEach((split) => {
			expect(split.amount).toBe(33.33);
		});
	});
});

describe("calculateRandomSplitsWithMembers", () => {
	it("should return empty array for no members", () => {
		const splits = calculateRandomSplitsWithMembers(100, []);
		expect(splits).toEqual([]);
	});

	it("should give full amount to single member", () => {
		const members: Member[] = [
			{ id: "1", groupId: "g1", name: "Alice", createdAt: "", updatedAt: "" },
		];

		const splits = calculateRandomSplitsWithMembers(100, members);
		expect(splits).toEqual([{ memberId: "1", amount: 100 }]);
	});

	it("should split randomly among members and sum to total", () => {
		const members: Member[] = [
			{ id: "1", groupId: "g1", name: "Alice", createdAt: "", updatedAt: "" },
			{ id: "2", groupId: "g1", name: "Bob", createdAt: "", updatedAt: "" },
			{ id: "3", groupId: "g1", name: "Charlie", createdAt: "", updatedAt: "" },
		];

		const totalAmount = 100;
		const splits = calculateRandomSplitsWithMembers(totalAmount, members);

		expect(splits).toHaveLength(3);

		// Each member should have some amount
		splits.forEach((split) => {
			expect(split.amount).toBeGreaterThan(0);
			expect(split.amount).toBeLessThanOrEqual(totalAmount);
		});

		// Total should equal the original amount
		const sum = splits.reduce((acc, split) => acc + split.amount, 0);
		expect(sum).toBeCloseTo(totalAmount, 2);
	});

	it("should produce different splits on multiple runs", () => {
		const members: Member[] = [
			{ id: "1", groupId: "g1", name: "Alice", createdAt: "", updatedAt: "" },
			{ id: "2", groupId: "g1", name: "Bob", createdAt: "", updatedAt: "" },
			{ id: "3", groupId: "g1", name: "Charlie", createdAt: "", updatedAt: "" },
		];

		// Run multiple times and check that we get different results
		const results = new Set<string>();
		for (let i = 0; i < 10; i++) {
			const splits = calculateRandomSplitsWithMembers(100, members);
			const key = splits.map((s) => s.amount).join(",");
			results.add(key);
		}

		// Should have at least 2 different results out of 10 runs
		expect(results.size).toBeGreaterThan(1);
	});
});

describe("validateExpenseForm", () => {
	it("should validate valid form data", () => {
		const result = validateExpenseForm("member1", "50.00", "Lunch");
		expect(result.isValid).toBe(true);
		expect(result.error).toBeUndefined();
	});

	it("should reject missing payer", () => {
		const result = validateExpenseForm("", "50.00", "Lunch");
		expect(result.isValid).toBe(false);
		expect(result.error).toBe("Please select who paid");
	});

	it("should reject missing amount", () => {
		const result = validateExpenseForm("member1", "", "Lunch");
		expect(result.isValid).toBe(false);
		expect(result.error).toBe("Please enter a valid amount");
	});

	it("should reject invalid amount", () => {
		const result = validateExpenseForm("member1", "abc", "Lunch");
		expect(result.isValid).toBe(false);
		expect(result.error).toBe("Please enter a valid amount");
	});

	it("should reject zero amount", () => {
		const result = validateExpenseForm("member1", "0", "Lunch");
		expect(result.isValid).toBe(false);
		expect(result.error).toBe("Please enter a valid amount");
	});

	it("should reject missing description", () => {
		const result = validateExpenseForm("member1", "50", "");
		expect(result.isValid).toBe(false);
		expect(result.error).toBe("Please enter a description");
	});
});

describe("validateCustomSplits", () => {
	it("should validate splits that sum to total", () => {
		const splits = {
			member1: "30",
			member2: "30",
			member3: "40",
		};
		const result = validateCustomSplits(splits, 100);
		expect(result.isValid).toBe(true);
	});

	it("should reject splits that don't sum to total", () => {
		const splits = {
			member1: "30",
			member2: "30",
			member3: "30",
		};
		const result = validateCustomSplits(splits, 100);
		expect(result.isValid).toBe(false);
		expect(result.error).toBe("Splits must sum to 100.00 (currently: 90.00)");
	});

	it("should handle empty strings as zero", () => {
		const splits = {
			member1: "50",
			member2: "50",
			member3: "",
		};
		const result = validateCustomSplits(splits, 100);
		expect(result.isValid).toBe(true);
	});
});

describe("parseSplitAmounts", () => {
	it("should parse valid split amounts", () => {
		const splits = {
			member1: "30.50",
			member2: "20",
			member3: "49.50",
		};
		const result = parseSplitAmounts(splits);
		expect(result).toEqual([
			{ memberId: "member1", amount: 30.5 },
			{ memberId: "member2", amount: 20 },
			{ memberId: "member3", amount: 49.5 },
		]);
	});

	it("should treat empty strings as zero and exclude them", () => {
		const splits = {
			member1: "50",
			member2: "",
		};
		const result = parseSplitAmounts(splits);
		// Empty strings are parsed as 0 and excluded from the result
		expect(result).toEqual([{ memberId: "member1", amount: 50 }]);
	});
});
