import type { Expense, ExpenseSplit, Member } from "@split-fool/shared";

export interface MemberBalance {
	memberId: string;
	memberName: string;
	totalPaid: number;
	totalOwed: number;
	balance: number; // positive = owed money, negative = owes money
}

export interface Settlement {
	from: { id: string; name: string };
	to: { id: string; name: string };
	amount: number;
}

/**
 * Calculate balances for all members in a group
 */
export function calculateBalances(
	members: Member[],
	expenses: Expense[],
	splits: ExpenseSplit[],
): MemberBalance[] {
	const balances = new Map<string, MemberBalance>();

	// Initialize balances for all members
	for (const member of members) {
		balances.set(member.id, {
			memberId: member.id,
			memberName: member.name,
			totalPaid: 0,
			totalOwed: 0,
			balance: 0,
		});
	}

	// Calculate what each member paid
	for (const expense of expenses) {
		const balance = balances.get(expense.payerId);
		if (balance) {
			balance.totalPaid += expense.amount;
		}
	}

	// Calculate what each member owes
	for (const split of splits) {
		const balance = balances.get(split.memberId);
		if (balance) {
			balance.totalOwed += split.amount;
		}
	}

	// Calculate net balance for each member
	for (const balance of balances.values()) {
		balance.balance = balance.totalPaid - balance.totalOwed;
	}

	return Array.from(balances.values());
}

/**
 * Calculate settlements to balance the group
 * Uses a simple algorithm to minimize number of transactions
 */
export function calculateSettlements(balances: MemberBalance[]): Settlement[] {
	const settlements: Settlement[] = [];

	// Separate creditors and debtors
	const creditors = balances
		.filter((b) => b.balance > 0)
		.map((b) => ({ ...b }))
		.sort((a, b) => b.balance - a.balance);

	const debtors = balances
		.filter((b) => b.balance < 0)
		.map((b) => ({ ...b, balance: Math.abs(b.balance) }))
		.sort((a, b) => b.balance - a.balance);

	// Match creditors with debtors
	let creditorIndex = 0;
	let debtorIndex = 0;

	while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
		const creditor = creditors[creditorIndex];
		const debtor = debtors[debtorIndex];

		const amount = Math.min(creditor.balance, debtor.balance);

		if (amount > 0.01) {
			// Avoid tiny amounts due to floating point
			settlements.push({
				from: { id: debtor.memberId, name: debtor.memberName },
				to: { id: creditor.memberId, name: creditor.memberName },
				amount: Math.round(amount * 100) / 100, // Round to cents
			});
		}

		creditor.balance -= amount;
		debtor.balance -= amount;

		if (creditor.balance < 0.01) {
			creditorIndex++;
		}
		if (debtor.balance < 0.01) {
			debtorIndex++;
		}
	}

	return settlements;
}

/**
 * Split an expense equally among members
 */
export function splitExpenseEqually(
	totalAmount: number,
	memberIds: string[],
): { memberId: string; amount: number }[] {
	if (memberIds.length === 0) {
		throw new Error("Cannot split expense among zero members");
	}

	const perPersonAmount = totalAmount / memberIds.length;
	const roundedAmount = Math.round(perPersonAmount * 100) / 100;
	const remainder = totalAmount - roundedAmount * memberIds.length;

	const splits = memberIds.map((memberId, index) => ({
		memberId,
		amount:
			roundedAmount + (index === 0 ? Math.round(remainder * 100) / 100 : 0),
	}));

	return splits;
}

/**
 * Validate that splits add up to the total expense amount
 */
export function validateSplits(
	totalAmount: number,
	splits: { amount: number }[],
): boolean {
	const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0);
	return Math.abs(totalAmount - splitTotal) < 0.01; // Allow for tiny rounding differences
}
