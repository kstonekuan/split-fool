import type { Expense, ExpenseSplit, Group, Member } from "@split-fool/shared";

export interface DatabaseAdapter {
	// Groups
	createGroup(group: Group): Promise<void>;
	getGroup(code: string): Promise<Group | null>;
	deleteGroup(code: string): Promise<void>;

	// Members
	createMember(member: Member): Promise<void>;
	getMembers(groupCode: string): Promise<Member[]>;
	deleteMember(groupCode: string, memberId: string): Promise<void>;

	// Expenses
	createExpense(expense: Expense): Promise<void>;
	getExpenses(groupCode: string): Promise<Expense[]>;
	deleteExpense(groupCode: string, expenseId: string): Promise<void>;

	// Splits
	createSplits(splits: ExpenseSplit[]): Promise<void>;
	getSplits(groupCode: string, expenseId: string): Promise<ExpenseSplit[]>;
	deleteSplits(groupCode: string, expenseId: string): Promise<void>;

	// Cleanup
	cleanupOldGroups(daysOld: number): Promise<number>;
}

export type DatabaseConfig = {
	region?: string;
	tableName?: string;
};
