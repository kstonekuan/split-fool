import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import type { Expense, ExpenseSplit, Group, Member } from "@split-fool/shared";
import {
	createSplitFoolService,
	type SplitFoolService,
} from "./electrodb/service";
import { ensureTableExists } from "./init-table";
import type { DatabaseAdapter } from "./types";

interface ElectroDBAdapterConfig {
	region: string;
	tableName: string;
	endpoint?: string;
}

export class ElectroDBAdapter implements DatabaseAdapter {
	private service: SplitFoolService;
	private lastExpenseGroupId?: string;
	private tableInitPromise: Promise<void>;

	constructor(config: ElectroDBAdapterConfig) {
		const client = new DynamoDBClient({
			region: config.region,
			endpoint: config.endpoint,
		});

		this.service = createSplitFoolService({
			tableName: config.tableName,
			client,
		});

		// Initialize table in the background if using local DynamoDB
		if (config.endpoint) {
			this.tableInitPromise = ensureTableExists(client, config.tableName);
		} else {
			this.tableInitPromise = Promise.resolve();
		}
	}

	private async ensureTableReady(): Promise<void> {
		await this.tableInitPromise;
	}

	// Groups
	async createGroup(group: Group): Promise<void> {
		await this.ensureTableReady();
		await this.service.entities.group.put(group).go();
	}

	async getGroup(code: string): Promise<Group | null> {
		await this.ensureTableReady();
		const result = await this.service.entities.group.get({ code }).go();

		if (!result.data) {
			return null;
		}

		return {
			id: result.data.id,
			code: result.data.code,
			name: result.data.name,
			createdAt: result.data.createdAt,
			updatedAt: result.data.updatedAt,
		};
	}

	async deleteGroup(code: string): Promise<void> {
		// Query all related entities separately
		const [members, expenses] = await Promise.all([
			this.service.entities.member.query.byGroup({ groupId: code }).go(),
			this.service.entities.expense.query.byGroup({ groupId: code }).go(),
		]);

		// Get all expense splits for each expense
		const splitPromises = expenses.data.map((expense) =>
			this.service.entities.expenseSplit.query
				.byExpense({ expenseId: expense.id })
				.go(),
		);
		const splitResults = await Promise.all(splitPromises);
		const allSplits = splitResults.flatMap((result) => result.data);

		// Delete all items in parallel
		const deletePromises = [];

		// Delete group
		deletePromises.push(this.service.entities.group.delete({ code }).go());

		// Delete members
		for (const member of members.data) {
			deletePromises.push(
				this.service.entities.member
					.delete({ groupId: code, id: member.id })
					.go(),
			);
		}

		// Delete expenses
		for (const expense of expenses.data) {
			deletePromises.push(
				this.service.entities.expense
					.delete({ groupId: code, id: expense.id })
					.go(),
			);
		}

		// Delete expense splits
		for (const split of allSplits) {
			deletePromises.push(
				this.service.entities.expenseSplit
					.delete({
						groupId: code,
						expenseId: split.expenseId,
						memberId: split.memberId,
					})
					.go(),
			);
		}

		await Promise.all(deletePromises);
	}

	// Members
	async createMember(member: Member): Promise<void> {
		await this.service.entities.member.put(member).go();
	}

	async getMembers(groupCode: string): Promise<Member[]> {
		const result = await this.service.entities.member.query
			.byGroup({ groupId: groupCode })
			.go();

		return result.data.map((item) => ({
			id: item.id,
			groupId: item.groupId,
			name: item.name,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
		}));
	}

	async deleteMember(groupCode: string, memberId: string): Promise<void> {
		await this.service.entities.member
			.delete({ groupId: groupCode, id: memberId })
			.go();
	}

	// Expenses
	async createExpense(expense: Expense): Promise<void> {
		// Store the groupId for use in createSplits
		this.lastExpenseGroupId = expense.groupId;
		await this.service.entities.expense.put(expense).go();
	}

	async getExpenses(groupCode: string): Promise<Expense[]> {
		const result = await this.service.entities.expense.query
			.byGroup({ groupId: groupCode })
			.go();

		// Sort by date, then by creation time, then by id (most recent first)
		return result.data
			.sort((a, b) => {
				// First sort by expense date
				const dateCompare = b.date.localeCompare(a.date);
				if (dateCompare !== 0) return dateCompare;

				// Then by creation timestamp
				const createdAtCompare = b.createdAt.localeCompare(a.createdAt);
				if (createdAtCompare !== 0) return createdAtCompare;

				// Finally by id as tiebreaker
				return b.id.localeCompare(a.id);
			})
			.map((item) => ({
				id: item.id,
				groupId: item.groupId,
				payerId: item.payerId,
				amount: item.amount,
				description: item.description,
				date: item.date,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			}));
	}

	async deleteExpense(groupCode: string, expenseId: string): Promise<void> {
		// Delete expense and all its splits
		const splits = await this.getSplits(groupCode, expenseId);

		const deletePromises = [
			this.service.entities.expense
				.delete({ groupId: groupCode, id: expenseId })
				.go(),
		];

		// Delete all splits
		for (const split of splits) {
			deletePromises.push(
				this.service.entities.expenseSplit
					.delete({
						groupId: groupCode,
						expenseId: expenseId,
						memberId: split.memberId,
					})
					.go() as any,
			);
		}

		await Promise.all(deletePromises);
	}

	// Splits
	async createSplits(splits: ExpenseSplit[]): Promise<void> {
		if (splits.length === 0) {
			return;
		}

		// We need the groupId for the splits, but it's not in the ExpenseSplit type
		// We'll use a workaround: query all groups and find the one with this expense
		// This is inefficient but maintains the interface contract

		// For now, we'll use a hack: store the groupId in a closure from createExpense
		// In practice, this adapter is always used with the expense service which creates
		// the expense first, so we can store the last created expense's groupId
		const groupId = this.lastExpenseGroupId;

		if (!groupId) {
			throw new Error("Unable to determine groupId for splits");
		}

		// ElectroDB doesn't have batch put, so we'll do parallel puts
		const putPromises = splits.map((split) =>
			this.service.entities.expenseSplit
				.put({
					id: split.id,
					groupId,
					expenseId: split.expenseId,
					memberId: split.memberId,
					amount: split.amount,
					createdAt: split.createdAt,
				})
				.go(),
		);

		await Promise.all(putPromises);
	}

	async getSplits(
		_groupCode: string,
		expenseId: string,
	): Promise<ExpenseSplit[]> {
		// Use GSI to query splits by expense
		const result = await this.service.entities.expenseSplit.query
			.byExpense({ expenseId })
			.go();

		return result.data.map((item) => ({
			id: item.id,
			expenseId: item.expenseId,
			memberId: item.memberId,
			amount: item.amount,
			createdAt: item.createdAt,
		}));
	}

	async deleteSplits(groupCode: string, expenseId: string): Promise<void> {
		const splits = await this.getSplits(groupCode, expenseId);

		const deletePromises = splits.map((split) =>
			this.service.entities.expenseSplit
				.delete({
					groupId: groupCode,
					expenseId: expenseId,
					memberId: split.memberId,
				})
				.go(),
		);

		await Promise.all(deletePromises);
	}

	// Cleanup
	async cleanupOldGroups(daysOld: number): Promise<number> {
		// ElectroDB doesn't provide direct TTL queries, so we'll rely on DynamoDB's TTL feature
		// The TTL attribute is already set on groups, so DynamoDB will automatically delete them
		// This method is kept for compatibility but returns 0
		console.log(
			`Note: Cleanup is handled automatically by DynamoDB TTL (${daysOld} days)`,
		);
		return 0;
	}
}
