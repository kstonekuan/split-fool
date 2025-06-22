export interface Group {
	id: string;
	code: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

export interface Member {
	id: string;
	groupId: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

export interface Expense {
	id: string;
	groupId: string;
	payerId: string;
	amount: number;
	description: string;
	date: string;
	createdAt: string;
	updatedAt: string;
}

export interface ExpenseSplit {
	id: string;
	expenseId: string;
	memberId: string;
	amount: number;
	createdAt: string;
}

export interface Balance {
	memberId: string;
	memberName: string;
	balance: number;
}

export interface Settlement {
	fromMemberId: string;
	fromMemberName: string;
	toMemberId: string;
	toMemberName: string;
	amount: number;
}

export interface CreateGroupRequest {
	name: string;
}

export interface CreateGroupResponse {
	group: Group;
}

export interface CreateMemberRequest {
	name: string;
}

export interface CreateExpenseRequest {
	payerId: string;
	amount: number;
	description: string;
	date?: string;
	splits: Array<{
		memberId: string;
		amount: number;
	}>;
}

export interface GroupDetailsResponse {
	group: Group;
	members: Member[];
	expenses: Expense[];
	balances: Balance[];
	settlements: Settlement[];
}

export interface GetGroupResponse {
	group: Group;
}

export interface GetMembersResponse {
	members: Member[];
}

export interface GetExpensesResponse {
	expenses: Expense[];
}

export interface GetExpenseSplitsResponse {
	splits: ExpenseSplit[];
}

export interface CreateMemberResponse {
	member: Member;
}

export interface CreateExpenseResponse {
	expense: Expense;
}
