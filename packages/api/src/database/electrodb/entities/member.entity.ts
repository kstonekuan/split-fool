import { Entity } from "electrodb";

export const MemberEntity = new Entity({
	model: {
		entity: "member",
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
				template: "MEMBER#${id}",
			},
		},
	},
});
