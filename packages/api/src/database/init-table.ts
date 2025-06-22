import {
	CreateTableCommand,
	DescribeTableCommand,
	type DynamoDBClient,
	ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";

export async function ensureTableExists(
	client: DynamoDBClient,
	tableName: string,
): Promise<void> {
	try {
		// Check if table exists
		await client.send(new DescribeTableCommand({ TableName: tableName }));
		console.log(`Table ${tableName} already exists`);
		return;
	} catch (error) {
		if (!(error instanceof ResourceNotFoundException)) {
			throw error;
		}
		// Table doesn't exist, create it
	}

	console.log(`Creating table ${tableName}...`);

	try {
		await client.send(
			new CreateTableCommand({
				TableName: tableName,
				KeySchema: [
					{ AttributeName: "PK", KeyType: "HASH" },
					{ AttributeName: "SK", KeyType: "RANGE" },
				],
				AttributeDefinitions: [
					{ AttributeName: "PK", AttributeType: "S" },
					{ AttributeName: "SK", AttributeType: "S" },
					{ AttributeName: "GSI1PK", AttributeType: "S" },
					{ AttributeName: "GSI1SK", AttributeType: "S" },
				],
				GlobalSecondaryIndexes: [
					{
						IndexName: "GSI1",
						KeySchema: [
							{ AttributeName: "GSI1PK", KeyType: "HASH" },
							{ AttributeName: "GSI1SK", KeyType: "RANGE" },
						],
						Projection: {
							ProjectionType: "ALL",
						},
						ProvisionedThroughput: {
							ReadCapacityUnits: 5,
							WriteCapacityUnits: 5,
						},
					},
				],
				BillingMode: "PROVISIONED",
				ProvisionedThroughput: {
					ReadCapacityUnits: 5,
					WriteCapacityUnits: 5,
				},
				StreamSpecification: {
					StreamEnabled: true,
					StreamViewType: "NEW_AND_OLD_IMAGES",
				},
			}),
		);

		console.log(`Table ${tableName} created successfully`);
	} catch (error) {
		console.error("Error creating table:", error);
		throw error;
	}
}
