import { Entity } from "electrodb";

export const ExpenseSplitEntity = new Entity({
	model: {
		entity: "expenseSplit",
		version: "1",
		service: "splitfool",
	},
	attributes: {
		id: {
			type: "string",
			required: true,
		},
		groupId: {
			type: "string",
			required: true,
			field: "groupId",
		},
		expenseId: {
			type: "string",
			required: true,
			field: "expenseId",
		},
		memberId: {
			type: "string",
			required: true,
			field: "memberId",
		},
		amount: {
			type: "number",
			required: true,
		},
		createdAt: {
			type: "string",
			required: true,
			default: () => new Date().toISOString(),
			set: (val?: string) => val || new Date().toISOString(),
		},
	},
	indexes: {
		byGroup: {
			pk: {
				field: "PK",
				composite: ["groupId"],
				template: "GROUP#${groupId}",
			},
			sk: {
				field: "SK",
				composite: ["expenseId", "memberId"],
				template: "SPLIT#${expenseId}#${memberId}",
			},
		},
		byExpense: {
			index: "GSI1",
			pk: {
				field: "GSI1PK",
				composite: ["expenseId"],
				template: "EXPENSE#${expenseId}",
			},
			sk: {
				field: "GSI1SK",
				composite: ["memberId"],
				template: "SPLIT#${memberId}",
			},
		},
	},
});
