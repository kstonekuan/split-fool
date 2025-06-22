import type { ScheduledHandler } from "aws-lambda";
import { createDatabaseAdapter } from "./database/factory";

const dbConfig = {
	region: process.env.AWS_REGION || "ap-southeast-1",
	tableName: process.env.TABLE_NAME || "splitfool",
};

export const handler: ScheduledHandler = async (event, _context) => {
	console.log("Running cleanup job", event);

	try {
		const db = createDatabaseAdapter(dbConfig);
		const deletedCount = await db.cleanupOldGroups(30);

		console.log(`Cleaned up ${deletedCount} old groups`);
	} catch (error) {
		console.error("Cleanup error:", error);
		throw error;
	}
};
