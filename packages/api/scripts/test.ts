#!/usr/bin/env tsx
import { nanoid } from "nanoid";
import { createDatabaseAdapter } from "../src/database/factory";

async function testDatabase() {
	console.log("🧪 Testing database implementation...\n");

	process.env.DYNAMODB_ENDPOINT = "http://localhost:8000";
	process.env.TABLE_NAME = "splitfool-local";

	const db = createDatabaseAdapter({
		region: "ap-southeast-1",
		tableName: "splitfool-local",
	});

	try {
		// Test 1: Create a group
		console.log("1️⃣ Creating a group...");
		const groupCode = nanoid(6);
		const group = {
			id: nanoid(),
			code: groupCode,
			name: "ElectroDB Test Group",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		await db.createGroup(group);
		console.log("✅ Group created:", group);

		// Test 2: Get the group
		console.log("\n2️⃣ Getting the group...");
		const fetchedGroup = await db.getGroup(groupCode);
		console.log("✅ Group fetched:", fetchedGroup);

		// Test 3: Create members
		console.log("\n3️⃣ Creating members...");
		const member1 = {
			id: nanoid(),
			groupId: groupCode,
			name: "Alice",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		const member2 = {
			id: nanoid(),
			groupId: groupCode,
			name: "Bob",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		await db.createMember(member1);
		await db.createMember(member2);
		console.log("✅ Members created");

		// Test 4: Get members
		console.log("\n4️⃣ Getting members...");
		const members = await db.getMembers(groupCode);
		console.log("✅ Members fetched:", members);

		// Test 5: Create an expense
		console.log("\n5️⃣ Creating an expense...");
		const expense = {
			id: nanoid(),
			groupId: groupCode,
			payerId: member1.id,
			amount: 100,
			description: "Test expense",
			date: new Date().toISOString(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		await db.createExpense(expense);
		console.log("✅ Expense created:", expense);

		// Test 6: Create splits
		console.log("\n6️⃣ Creating expense splits...");
		const splits = [
			{
				id: nanoid(),
				expenseId: expense.id,
				memberId: member1.id,
				amount: 50,
				createdAt: new Date().toISOString(),
			},
			{
				id: nanoid(),
				expenseId: expense.id,
				memberId: member2.id,
				amount: 50,
				createdAt: new Date().toISOString(),
			},
		];
		await db.createSplits(splits);
		console.log("✅ Splits created");

		// Test 7: Get expenses
		console.log("\n7️⃣ Getting expenses...");
		const expenses = await db.getExpenses(groupCode);
		console.log("✅ Expenses fetched:", expenses);

		// Test 8: Get splits
		console.log("\n8️⃣ Getting splits...");
		const fetchedSplits = await db.getSplits(groupCode, expense.id);
		console.log("✅ Splits fetched:", fetchedSplits);

		// Test 9: Delete a member
		console.log("\n9️⃣ Deleting a member...");
		await db.deleteMember(groupCode, member2.id);
		const remainingMembers = await db.getMembers(groupCode);
		console.log("✅ Member deleted. Remaining:", remainingMembers);

		// Test 10: Delete expense
		console.log("\n🔟 Deleting expense...");
		await db.deleteExpense(groupCode, expense.id);
		const remainingExpenses = await db.getExpenses(groupCode);
		console.log("✅ Expense deleted. Remaining:", remainingExpenses);

		// Test 11: Delete group (cascade delete)
		console.log("\n1️⃣1️⃣ Deleting group (cascade)...");
		await db.deleteGroup(groupCode);
		const deletedGroup = await db.getGroup(groupCode);
		console.log("✅ Group deleted:", deletedGroup);

		// Test 12: Cleanup old groups
		console.log("\n1️⃣2️⃣ Testing cleanup...");
		const cleaned = await db.cleanupOldGroups(30);
		console.log("✅ Cleanup result:", cleaned);

		console.log(
			"\n🎉 All tests passed! ElectroDB implementation is working correctly.",
		);
	} catch (error) {
		console.error("\n❌ Test failed:", error);
		process.exit(1);
	}
}

// Run the tests
testDatabase().catch(console.error);
