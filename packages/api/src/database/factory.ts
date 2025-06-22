import { ElectroDBAdapter } from "./electrodb-adapter";
import type { DatabaseAdapter, DatabaseConfig } from "./types";

export function createDatabaseAdapter(config: DatabaseConfig): DatabaseAdapter {
	const region = config.region || process.env.AWS_REGION || "us-east-1";
	const tableName = config.tableName || process.env.TABLE_NAME || "splitfool";

	// For local development, use DynamoDB Local
	const endpoint =
		process.env.DYNAMODB_ENDPOINT ||
		(process.env.NODE_ENV === "development"
			? "http://localhost:8000"
			: undefined);

	return new ElectroDBAdapter({
		region,
		tableName,
		endpoint,
	});
}
