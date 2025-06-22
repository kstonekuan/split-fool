import type { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Service } from "electrodb";
import { ExpenseEntity } from "./entities/expense.entity";
import { ExpenseSplitEntity } from "./entities/expense-split.entity";
import { GroupEntity } from "./entities/group.entity";
import { MemberEntity } from "./entities/member.entity";

export interface ElectroDBConfig {
	tableName: string;
	client: DynamoDBClient;
}

export function createSplitFoolService(config: ElectroDBConfig) {
	const table = {
		table: config.tableName,
		client: config.client,
	};

	const service = new Service(
		{
			group: GroupEntity,
			member: MemberEntity,
			expense: ExpenseEntity,
			expenseSplit: ExpenseSplitEntity,
		},
		table,
	);

	// Collections are automatically created based on shared index patterns
	// ElectroDB will detect that multiple entities share the same PK pattern

	return service;
}

export type SplitFoolService = ReturnType<typeof createSplitFoolService>;
