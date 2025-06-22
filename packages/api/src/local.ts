import { serve } from "@hono/node-server";
import { createApp } from "./api";
import { createDatabaseAdapter } from "./database/factory";

// Create DynamoDB adapter for local development
const dbConfig = {
	region: process.env.AWS_REGION || "us-east-1",
	tableName: process.env.TABLE_NAME || "splitfool-local",
};

// Set environment for local DynamoDB
process.env.DYNAMODB_ENDPOINT =
	process.env.DYNAMODB_ENDPOINT || "http://localhost:8000";
process.env.NODE_ENV = "development";

const db = createDatabaseAdapter(dbConfig);
const app = createApp(db);

const port = parseInt(process.env.PORT || "3000", 10);

console.log(`Server is running on http://localhost:${port}`);
console.log(`Using DynamoDB Local at ${process.env.DYNAMODB_ENDPOINT}`);
console.log(`Table: ${dbConfig.tableName}`);

serve({
	fetch: app.fetch,
	port,
});
