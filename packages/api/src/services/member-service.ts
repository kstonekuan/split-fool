import type { CreateMemberRequest, Member } from "@split-fool/shared";
import { nanoid } from "nanoid";
import type { DatabaseAdapter } from "../database/types";

export class MemberService {
	constructor(private db: DatabaseAdapter) {}

	async createMember(
		groupId: string,
		data: CreateMemberRequest,
	): Promise<Member> {
		// Check if member with same name already exists in this group
		const existingMembers = await this.db.getMembers(groupId);
		const nameExists = existingMembers.some(
			member => member.name.toLowerCase() === data.name.toLowerCase()
		);
		
		if (nameExists) {
			throw new Error(`A member named "${data.name}" already exists in this group`);
		}

		const id = nanoid();
		const now = new Date().toISOString();

		const member: Member = {
			id,
			groupId,
			name: data.name.trim(),
			createdAt: now,
			updatedAt: now,
		};

		await this.db.createMember(member);
		return member;
	}

	async getMembers(groupId: string): Promise<Member[]> {
		return this.db.getMembers(groupId);
	}

	async deleteMember(groupId: string, memberId: string): Promise<void> {
		await this.db.deleteMember(groupId, memberId);
	}
}
