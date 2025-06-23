import type { Context } from "aws-lambda";
import { createApp } from "./api";
import { createDatabaseAdapter } from "./database/factory";

const dbConfig = {
	region: process.env.AWS_REGION || "ap-southeast-1",
	tableName: process.env.TABLE_NAME || "splitfool",
};

const db = createDatabaseAdapter(dbConfig);
const app = createApp(db);

// Convert Lambda Function URL event to Request object
function createRequest(event: any): Request {
	// Lambda Function URL format
	const host = event.headers?.host || event.headers?.Host || 'localhost';
	const path = event.rawPath || event.path || '/';
	const url = `https://${host}${path}`;
	const method = event.requestContext?.http?.method || event.httpMethod || 'GET';

	const headers = new Headers();
	for (const [key, value] of Object.entries(event.headers || {})) {
		if (value && typeof value === 'string') {
			headers.set(key, value);
		}
	}

	const options: RequestInit = {
		method,
		headers,
	};

	if (event.body) {
		options.body = event.isBase64Encoded
			? Buffer.from(event.body, "base64").toString()
			: event.body;
	}

	return new Request(url, options);
}

// Convert Response object to Lambda response
async function createLambdaResponse(response: Response) {
	const body = await response.text();

	const headers: { [key: string]: string } = {};
	response.headers.forEach((value, key) => {
		headers[key] = value;
	});

	return {
		statusCode: response.status,
		headers,
		body,
	};
}

export const handler = async (event: any, _context: Context) => {
	try {
		const request = createRequest(event);
		const response = await app.fetch(request);
		return await createLambdaResponse(response);
	} catch (error) {
		console.error("Lambda handler error:", error);
		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ error: "Internal server error" }),
		};
	}
};
