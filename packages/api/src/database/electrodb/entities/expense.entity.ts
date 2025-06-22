import { Entity } from "electrodb";

export const ExpenseEntity = new Entity({
	model: {
		entity: "expense",
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
		payerId: {
			type: "string",
			required: true,
			field: "payerId",
		},
		amount: {
			type: "number",
			required: true,
		},
		description: {
			type: "string",
			required: true,
		},
		date: {
			type: "string",
			required: true,
		},
		createdAt: {
			type: "string",
			required: true,
			default: () => new Date().toISOString(),
			set: (val?: string) => val || new Date().toISOString(),
		},
		updatedAt: {
			type: "string",
			required: true,
			default: () => new Date().toISOString(),
			set: () => new Date().toISOString(),
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
				composite: ["id"],
				template: "EXPENSE#${id}",
			},
		},
		byExpense: {
			index: "GSI1",
			pk: {
				field: "GSI1PK",
				composite: ["id"],
				template: "EXPENSE#${id}",
			},
			sk: {
				field: "GSI1SK",
				composite: [],
				template: "EXPENSE#INFO",
			},
		},
	},
});
