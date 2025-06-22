import { Entity } from "electrodb";

export const GroupEntity = new Entity({
	model: {
		entity: "group",
		version: "1",
		service: "splitfool",
	},
	attributes: {
		code: {
			type: "string",
			required: true,
		},
		id: {
			type: "string",
			required: true,
		},
		name: {
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
		ttl: {
			type: "number",
			required: true,
			default: () => Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
			set: () => Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
		},
	},
	indexes: {
		byCode: {
			pk: {
				field: "PK",
				composite: ["code"],
				template: "GROUP#${code}",
			},
			sk: {
				field: "SK",
				composite: [],
				template: "GROUP#INFO",
			},
		},
	},
});
