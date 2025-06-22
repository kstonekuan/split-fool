import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { createApp } from "./api";
import { createDatabaseAdapter } from "./database/factory";

const dbConfig = {
	region: process.env.AWS_REGION || "us-east-1",
	tableName: process.env.TABLE_NAME || "splitfool",
};

const db = createDatabaseAdapter(dbConfig);
const app = createApp(db);

// Convert API Gateway event to Request object
function createRequest(event: APIGatewayProxyEvent): Request {
	const url = `https://${event.headers.Host}${event.path}`;
	const method = event.httpMethod;

	const headers = new Headers();
	for (const [key, value] of Object.entries(event.headers || {})) {
		if (value) {
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

// Convert Response object to API Gateway response
async function createAPIGatewayResponse(response: Response) {
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

export const handler: APIGatewayProxyHandler = async (event, _context) => {
	try {
		const request = createRequest(event);
		const response = await app.fetch(request);
		return await createAPIGatewayResponse(response);
	} catch (error) {
		console.error("Lambda handler error:", error);
		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ error: "Internal server error" }),
		};
	}
};
