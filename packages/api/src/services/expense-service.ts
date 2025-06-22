import type {
	Balance,
	CreateExpenseRequest,
	Expense,
	ExpenseSplit,
	ExpenseWithSplits,
	Settlement,
} from "@split-fool/shared";
import { calculateSettlements } from "@split-fool/shared";
import { format } from "date-fns";
import { nanoid } from "nanoid";
import type { DatabaseAdapter } from "../database/types";

export class ExpenseService {
	constructor(private db: DatabaseAdapter) {}

	async createExpense(
		groupId: string,
		data: CreateExpenseRequest,
	): Promise<Expense> {
		const id = nanoid();
		const now = new Date();
		const nowISO = now.toISOString();

		const expense: Expense = {
			id,
			groupId,
			payerId: data.payerId,
			amount: data.amount,
			description: data.description,
			date: data.date || format(now, "yyyy-MM-dd"),
			createdAt: nowISO,
			updatedAt: nowISO,
		};

		await this.db.createExpense(expense);

		// Create splits
		const splits: ExpenseSplit[] = data.splits.map((split) => ({
			id: nanoid(),
			expenseId: id,
			memberId: split.memberId,
			amount: split.amount,
			createdAt: nowISO,
		}));

		await this.db.createSplits(splits);

		return expense;
	}

	async getExpenses(groupId: string): Promise<Expense[]> {
		return this.db.getExpenses(groupId);
	}

	async getExpensesWithSplits(groupId: string): Promise<ExpenseWithSplits[]> {
		const expenses = await this.db.getExpenses(groupId);
		const expensesWithSplits: ExpenseWithSplits[] = [];

		for (const expense of expenses) {
			const splits = await this.db.getSplits(groupId, expense.id);
			expensesWithSplits.push({
				...expense,
				splits,
			});
		}

		return expensesWithSplits;
	}

	async deleteExpense(groupId: string, expenseId: string): Promise<void> {
		await this.db.deleteSplits(groupId, expenseId);
		await this.db.deleteExpense(groupId, expenseId);
	}

	async getSplits(groupId: string, expenseId: string): Promise<ExpenseSplit[]> {
		return this.db.getSplits(groupId, expenseId);
	}

	async getBalances(groupId: string): Promise<Balance[]> {
		const expenses = await this.db.getExpenses(groupId);
		const members = await this.db.getMembers(groupId);
		const balanceMap = new Map<string, number>();

		// Initialize all members with 0 balance
		for (const member of members) {
			balanceMap.set(member.id, 0);
		}

		// Calculate balances from all expenses and splits
		for (const expense of expenses) {
			const splits = await this.db.getSplits(groupId, expense.id);

			// Payer paid the full amount (positive balance)
			const currentPayerBalance = balanceMap.get(expense.payerId) || 0;
			balanceMap.set(expense.payerId, currentPayerBalance + expense.amount);

			// Each person in the split owes their portion (negative balance)
			for (const split of splits) {
				const currentBalance = balanceMap.get(split.memberId) || 0;
				balanceMap.set(split.memberId, currentBalance - split.amount);
			}
		}

		// Convert to Balance array with member names
		const balances: Balance[] = [];
		for (const [memberId, balance] of balanceMap.entries()) {
			const member = members.find((m) => m.id === memberId);
			if (member) {
				balances.push({
					memberId,
					memberName: member.name,
					balance: balance,
				});
			}
		}

		return balances;
	}

	async getSettlements(groupId: string): Promise<Settlement[]> {
		const balances = await this.getBalances(groupId);
		return calculateSettlements(balances);
	}
}
