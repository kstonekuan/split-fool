import type {
	CreateExpenseRequest,
	CreateGroupRequest,
	CreateGroupResponse,
	CreateMemberRequest,
	Expense,
	GroupDetailsResponse,
	Member,
} from "@split-fool/shared";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

async function fetchApi(endpoint: string, options?: RequestInit) {
	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ error: "Network error" }));
		throw new Error(error.error || "API request failed");
	}

	return response.json();
}

export const api = {
	// Groups
	createGroup: async (
		data: CreateGroupRequest,
	): Promise<CreateGroupResponse> => {
		return fetchApi("/api/groups", {
			method: "POST",
			body: JSON.stringify(data),
		});
	},

	getGroup: async (code: string): Promise<GroupDetailsResponse> => {
		return fetchApi(`/api/groups/${code}`);
	},

	// Members
	createMember: async (
		code: string,
		data: CreateMemberRequest,
	): Promise<{ member: Member }> => {
		return fetchApi(`/api/groups/${code}/members`, {
			method: "POST",
			body: JSON.stringify(data),
		});
	},

	deleteMember: async (
		code: string,
		memberId: string,
	): Promise<{ success: boolean }> => {
		return fetchApi(`/api/groups/${code}/members/${memberId}`, {
			method: "DELETE",
		});
	},

	// Expenses
	createExpense: async (
		code: string,
		data: CreateExpenseRequest,
	): Promise<{ expense: Expense }> => {
		return fetchApi(`/api/groups/${code}/expenses`, {
			method: "POST",
			body: JSON.stringify(data),
		});
	},

	deleteExpense: async (
		code: string,
		expenseId: string,
	): Promise<{ success: boolean }> => {
		return fetchApi(`/api/groups/${code}/expenses/${expenseId}`, {
			method: "DELETE",
		});
	},
};
