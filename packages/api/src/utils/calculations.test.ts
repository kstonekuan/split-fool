import type { Expense, ExpenseSplit, Member } from "@split-fool/shared";
import { describe, expect, it } from "vitest";
import {
	calculateBalances,
	calculateSettlements,
	splitExpenseEqually,
	validateSplits,
} from "./calculations";

describe("calculateBalances", () => {
	it("should calculate correct balances for a simple scenario", () => {
		const members: Member[] = [
			{ id: "1", groupId: "g1", name: "Alice", createdAt: "", updatedAt: "" },
			{ id: "2", groupId: "g1", name: "Bob", createdAt: "", updatedAt: "" },
			{ id: "3", groupId: "g1", name: "Charlie", createdAt: "", updatedAt: "" },
		];

		const expenses: Expense[] = [
			{
				id: "e1",
				groupId: "g1",
				payerId: "1",
				amount: 90,
				description: "Dinner",
				date: "2024-01-01",
				createdAt: "",
				updatedAt: "",
			},
		];

		const splits: ExpenseSplit[] = [
			{ id: "s1", expenseId: "e1", memberId: "1", amount: 30, createdAt: "" },
			{ id: "s2", expenseId: "e1", memberId: "2", amount: 30, createdAt: "" },
			{ id: "s3", expenseId: "e1", memberId: "3", amount: 30, createdAt: "" },
		];

		const balances = calculateBalances(members, expenses, splits);

		expect(balances).toHaveLength(3);
		expect(balances.find((b) => b.memberId === "1")).toMatchObject({
			totalPaid: 90,
			totalOwed: 30,
			balance: 60,
		});
		expect(balances.find((b) => b.memberId === "2")).toMatchObject({
			totalPaid: 0,
			totalOwed: 30,
			balance: -30,
		});
		expect(balances.find((b) => b.memberId === "3")).toMatchObject({
			totalPaid: 0,
			totalOwed: 30,
			balance: -30,
		});
	});

	it("should handle multiple expenses and complex splits", () => {
		const members: Member[] = [
			{ id: "1", groupId: "g1", name: "Alice", createdAt: "", updatedAt: "" },
			{ id: "2", groupId: "g1", name: "Bob", createdAt: "", updatedAt: "" },
		];

		const expenses: Expense[] = [
			{
				id: "e1",
				groupId: "g1",
				payerId: "1",
				amount: 100,
				description: "Groceries",
				date: "2024-01-01",
				createdAt: "",
				updatedAt: "",
			},
			{
				id: "e2",
				groupId: "g1",
				payerId: "2",
				amount: 60,
				description: "Gas",
				date: "2024-01-02",
				createdAt: "",
				updatedAt: "",
			},
		];

		const splits: ExpenseSplit[] = [
			{ id: "s1", expenseId: "e1", memberId: "1", amount: 40, createdAt: "" },
			{ id: "s2", expenseId: "e1", memberId: "2", amount: 60, createdAt: "" },
			{ id: "s3", expenseId: "e2", memberId: "1", amount: 30, createdAt: "" },
			{ id: "s4", expenseId: "e2", memberId: "2", amount: 30, createdAt: "" },
		];

		const balances = calculateBalances(members, expenses, splits);

		expect(balances.find((b) => b.memberId === "1")).toMatchObject({
			totalPaid: 100,
			totalOwed: 70, // 40 + 30
			balance: 30,
		});
		expect(balances.find((b) => b.memberId === "2")).toMatchObject({
			totalPaid: 60,
			totalOwed: 90, // 60 + 30
			balance: -30,
		});
	});
});

describe("calculateSettlements", () => {
	it("should calculate simple settlement between two people", () => {
		const balances = [
			{
				memberId: "1",
				memberName: "Alice",
				totalPaid: 100,
				totalOwed: 50,
				balance: 50,
			},
			{
				memberId: "2",
				memberName: "Bob",
				totalPaid: 0,
				totalOwed: 50,
				balance: -50,
			},
		];

		const settlements = calculateSettlements(balances);

		expect(settlements).toHaveLength(1);
		expect(settlements[0]).toEqual({
			from: { id: "2", name: "Bob" },
			to: { id: "1", name: "Alice" },
			amount: 50,
		});
	});

	it("should minimize transactions for multiple people", () => {
		const balances = [
			{
				memberId: "1",
				memberName: "Alice",
				totalPaid: 120,
				totalOwed: 40,
				balance: 80,
			},
			{
				memberId: "2",
				memberName: "Bob",
				totalPaid: 0,
				totalOwed: 40,
				balance: -40,
			},
			{
				memberId: "3",
				memberName: "Charlie",
				totalPaid: 0,
				totalOwed: 40,
				balance: -40,
			},
		];

		const settlements = calculateSettlements(balances);

		expect(settlements).toHaveLength(2);
		expect(settlements).toContainEqual({
			from: { id: "2", name: "Bob" },
			to: { id: "1", name: "Alice" },
			amount: 40,
		});
		expect(settlements).toContainEqual({
			from: { id: "3", name: "Charlie" },
			to: { id: "1", name: "Alice" },
			amount: 40,
		});
	});

	it("should handle complex multi-creditor and multi-debtor scenarios", () => {
		const balances = [
			{
				memberId: "1",
				memberName: "Alice",
				totalPaid: 100,
				totalOwed: 25,
				balance: 75,
			},
			{
				memberId: "2",
				memberName: "Bob",
				totalPaid: 50,
				totalOwed: 25,
				balance: 25,
			},
			{
				memberId: "3",
				memberName: "Charlie",
				totalPaid: 0,
				totalOwed: 50,
				balance: -50,
			},
			{
				memberId: "4",
				memberName: "David",
				totalPaid: 0,
				totalOwed: 50,
				balance: -50,
			},
		];

		const settlements = calculateSettlements(balances);

		// Total owed: 100, Total credits: 100
		expect(settlements.length).toBeGreaterThan(0);

		// Verify total settlement amount equals total debt
		const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0);
		expect(totalSettled).toBe(100);
	});

	it("should handle zero balances", () => {
		const balances = [
			{
				memberId: "1",
				memberName: "Alice",
				totalPaid: 50,
				totalOwed: 50,
				balance: 0,
			},
			{
				memberId: "2",
				memberName: "Bob",
				totalPaid: 50,
				totalOwed: 50,
				balance: 0,
			},
		];

		const settlements = calculateSettlements(balances);
		expect(settlements).toHaveLength(0);
	});
});

describe("splitExpenseEqually", () => {
	it("should split expense equally among members", () => {
		const splits = splitExpenseEqually(90, ["1", "2", "3"]);

		expect(splits).toHaveLength(3);
		expect(splits[0]).toEqual({ memberId: "1", amount: 30 });
		expect(splits[1]).toEqual({ memberId: "2", amount: 30 });
		expect(splits[2]).toEqual({ memberId: "3", amount: 30 });
	});

	it("should handle uneven amounts with rounding", () => {
		const splits = splitExpenseEqually(100, ["1", "2", "3"]);

		expect(splits).toHaveLength(3);
		// 100/3 = 33.333..., so two get 33.33 and one gets 33.34
		const total = splits.reduce((sum, s) => sum + s.amount, 0);
		expect(total).toBeCloseTo(100, 2);
		expect(splits[0].amount).toBeCloseTo(33.34, 2); // First person gets the remainder
		expect(splits[1].amount).toBe(33.33);
		expect(splits[2].amount).toBe(33.33);
	});

	it("should handle single member", () => {
		const splits = splitExpenseEqually(50, ["1"]);

		expect(splits).toHaveLength(1);
		expect(splits[0]).toEqual({ memberId: "1", amount: 50 });
	});

	it("should throw error for zero members", () => {
		expect(() => splitExpenseEqually(100, [])).toThrowError(
			"Cannot split expense among zero members",
		);
	});

	it("should handle small amounts correctly", () => {
		const splits = splitExpenseEqually(1, ["1", "2"]);

		expect(splits).toHaveLength(2);
		expect(splits[0]).toEqual({ memberId: "1", amount: 0.5 });
		expect(splits[1]).toEqual({ memberId: "2", amount: 0.5 });
	});
});

describe("validateSplits", () => {
	it("should validate correct splits", () => {
		const isValid = validateSplits(100, [
			{ amount: 50 },
			{ amount: 30 },
			{ amount: 20 },
		]);

		expect(isValid).toBe(true);
	});

	it("should reject incorrect splits", () => {
		const isValid = validateSplits(100, [
			{ amount: 50 },
			{ amount: 30 },
			{ amount: 10 },
		]);

		expect(isValid).toBe(false);
	});

	it("should handle rounding differences", () => {
		// 100/3 = 33.333...
		const isValid = validateSplits(100, [
			{ amount: 33.33 },
			{ amount: 33.33 },
			{ amount: 33.34 },
		]);

		expect(isValid).toBe(true);
	});

	it("should handle empty splits", () => {
		const isValid = validateSplits(0, []);
		expect(isValid).toBe(true);
	});

	it("should handle very small rounding errors", () => {
		const isValid = validateSplits(100, [
			{ amount: 33.333 },
			{ amount: 33.333 },
			{ amount: 33.334 },
		]);

		expect(isValid).toBe(true);
	});
});
