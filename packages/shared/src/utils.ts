export function generateGroupCode(): string {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return code;
}

export function calculateSettlements(
	balances: Array<{ memberId: string; memberName: string; balance: number }>,
): Array<{
	fromMemberId: string;
	fromMemberName: string;
	toMemberId: string;
	toMemberName: string;
	amount: number;
}> {
	const settlements = [];
	const creditors = balances
		.filter((b) => b.balance > 0)
		.sort((a, b) => b.balance - a.balance);
	const debtors = balances
		.filter((b) => b.balance < 0)
		.sort((a, b) => a.balance - b.balance);

	let i = 0;
	let j = 0;

	while (i < creditors.length && j < debtors.length) {
		const creditor = creditors[i];
		const debtor = debtors[j];
		const amount = Math.min(creditor.balance, -debtor.balance);

		if (amount > 0.01) {
			settlements.push({
				fromMemberId: debtor.memberId,
				fromMemberName: debtor.memberName,
				toMemberId: creditor.memberId,
				toMemberName: creditor.memberName,
				amount: Math.round(amount * 100) / 100,
			});
		}

		creditor.balance -= amount;
		debtor.balance += amount;

		if (Math.abs(creditor.balance) < 0.01) {
			i++;
		}
		if (Math.abs(debtor.balance) < 0.01) {
			j++;
		}
	}

	return settlements;
}
