import type { CreateGroupRequest, Group } from "@split-fool/shared";
import { generateGroupCode } from "@split-fool/shared";
import { nanoid } from "nanoid";
import type { DatabaseAdapter } from "../database/types";

export class GroupService {
	constructor(private db: DatabaseAdapter) {}

	async createGroup(data: CreateGroupRequest): Promise<Group> {
		const id = nanoid();
		const now = new Date().toISOString();

		// Try to find a unique code
		let code: string;
		let attempts = 0;

		do {
			code = generateGroupCode();
			const existing = await this.db.getGroup(code);
			if (!existing) {
				break;
			}
			attempts++;
		} while (attempts < 10);

		if (attempts >= 10) {
			throw new Error("Failed to generate unique code");
		}

		const group: Group = {
			id,
			code,
			name: data.name,
			createdAt: now,
			updatedAt: now,
		};

		await this.db.createGroup(group);
		return group;
	}

	async getGroup(code: string): Promise<Group | null> {
		return this.db.getGroup(code);
	}
}
