import { zValidator } from "@hono/zod-validator";
import type {
	CreateExpenseResponse,
	CreateGroupResponse,
	CreateMemberResponse,
	GetExpenseSplitsResponse,
	GetExpensesResponse,
	GetGroupResponse,
	GetMembersResponse,
	GroupDetailsResponse,
} from "@split-fool/shared";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { DatabaseAdapter } from "./database/types";
import { ExpenseService } from "./services/expense-service";
import { GroupService } from "./services/group-service";
import { MemberService } from "./services/member-service";
import {
	createExpenseSchema,
	createGroupSchema,
	createMemberSchema,
	expenseIdSchema,
	groupCodeSchema,
	memberIdSchema,
} from "./validation/schemas";

export function createApp(db: DatabaseAdapter) {
	const app = new Hono();

	// Services
	const groupService = new GroupService(db);
	const memberService = new MemberService(db);
	const expenseService = new ExpenseService(db);

	// Middleware
	app.use("*", cors());
	app.use("*", logger());

	// Health check
	app.get("/", (c) => c.json({ status: "ok", service: "splitfool-api" }));
	app.get("/health", (c) =>
		c.json({
			status: "ok",
			service: "splitfool-api",
			timestamp: new Date().toISOString(),
		}),
	);

	// Group endpoints
	app.post("/api/groups", zValidator("json", createGroupSchema), async (c) => {
		try {
			const data = c.req.valid("json");
			const group = await groupService.createGroup(data);
			return c.json<CreateGroupResponse>({ group });
		} catch (error) {
			console.error("Error creating group:", error);
			return c.json({ error: "Failed to create group" }, 500);
		}
	});

	app.get(
		"/api/groups/:code",
		zValidator("param", groupCodeSchema),
		async (c) => {
			try {
				const { code } = c.req.valid("param");
				const group = await groupService.getGroup(code);

				if (!group) {
					return c.json({ error: "Group not found" }, 404);
				}

				// Get all related data
				const members = await memberService.getMembers(group.id);
				const expenses = await expenseService.getExpenses(group.id);
				const balances = await expenseService.getBalances(group.id);
				const settlements = await expenseService.getSettlements(group.id);

				return c.json<GroupDetailsResponse>({
					group,
					members,
					expenses,
					balances,
					settlements,
				});
			} catch (error) {
				console.error("Error getting group:", error);
				return c.json({ error: "Failed to get group" }, 500);
			}
		},
	);

	// Member endpoints
	app.post(
		"/api/groups/:code/members",
		zValidator("param", groupCodeSchema),
		zValidator("json", createMemberSchema),
		async (c) => {
			try {
				const { code } = c.req.valid("param");
				const data = c.req.valid("json");

				// Check if group exists
				const group = await groupService.getGroup(code);
				if (!group) {
					return c.json({ error: "Group not found" }, 404);
				}

				const member = await memberService.createMember(group.id, data);
				return c.json<CreateMemberResponse>({ member });
			} catch (error) {
				console.error("Error creating member:", error);
				return c.json({ error: "Failed to create member" }, 500);
			}
		},
	);

	app.get(
		"/api/groups/:code/members",
		zValidator("param", groupCodeSchema),
		async (c) => {
			try {
				const { code } = c.req.valid("param");

				// Get group to get its ID
				const group = await groupService.getGroup(code);
				if (!group) {
					return c.json({ error: "Group not found" }, 404);
				}

				const members = await memberService.getMembers(group.id);
				return c.json<GetMembersResponse>({ members });
			} catch (error) {
				console.error("Error getting members:", error);
				return c.json({ error: "Failed to get members" }, 500);
			}
		},
	);

	app.delete(
		"/api/groups/:code/members/:memberId",
		zValidator("param", groupCodeSchema.merge(memberIdSchema)),
		async (c) => {
			try {
				const { code, memberId } = c.req.valid("param");

				// Get group to get its ID
				const group = await groupService.getGroup(code);
				if (!group) {
					return c.json({ error: "Group not found" }, 404);
				}

				await memberService.deleteMember(group.id, memberId);
				return c.json({ success: true });
			} catch (error) {
				console.error("Error deleting member:", error);
				return c.json({ error: "Failed to delete member" }, 500);
			}
		},
	);

	// Expense endpoints
	app.post(
		"/api/groups/:code/expenses",
		zValidator("param", groupCodeSchema),
		zValidator("json", createExpenseSchema),
		async (c) => {
			try {
				const { code } = c.req.valid("param");
				const data = c.req.valid("json");

				// Get group to get its ID
				const group = await groupService.getGroup(code);
				if (!group) {
					return c.json({ error: "Group not found" }, 404);
				}

				const expense = await expenseService.createExpense(group.id, data);
				return c.json<CreateExpenseResponse>({ expense });
			} catch (error) {
				console.error("Error creating expense:", error);
				return c.json({ error: "Failed to create expense" }, 500);
			}
		},
	);

	app.get(
		"/api/groups/:code/expenses",
		zValidator("param", groupCodeSchema),
		async (c) => {
			try {
				const { code } = c.req.valid("param");

				// Get group to get its ID
				const group = await groupService.getGroup(code);
				if (!group) {
					return c.json({ error: "Group not found" }, 404);
				}

				const expenses = await expenseService.getExpenses(group.id);
				return c.json<GetExpensesResponse>({ expenses });
			} catch (error) {
				console.error("Error getting expenses:", error);
				return c.json({ error: "Failed to get expenses" }, 500);
			}
		},
	);

	app.get(
		"/api/groups/:code/expenses/:expenseId/splits",
		zValidator("param", groupCodeSchema.merge(expenseIdSchema)),
		async (c) => {
			try {
				const { code, expenseId } = c.req.valid("param");

				// Get group to get its ID
				const group = await groupService.getGroup(code);
				if (!group) {
					return c.json({ error: "Group not found" }, 404);
				}

				const splits = await expenseService.getSplits(group.id, expenseId);
				return c.json<GetExpenseSplitsResponse>({ splits });
			} catch (error) {
				console.error("Error getting splits:", error);
				return c.json({ error: "Failed to get splits" }, 500);
			}
		},
	);

	app.delete(
		"/api/groups/:code/expenses/:expenseId",
		zValidator("param", groupCodeSchema.merge(expenseIdSchema)),
		async (c) => {
			try {
				const { code, expenseId } = c.req.valid("param");

				// Get group to get its ID
				const group = await groupService.getGroup(code);
				if (!group) {
					return c.json({ error: "Group not found" }, 404);
				}

				await expenseService.deleteExpense(group.id, expenseId);
				return c.json({ success: true });
			} catch (error) {
				console.error("Error deleting expense:", error);
				return c.json({ error: "Failed to delete expense" }, 500);
			}
		},
	);

	return app;
}
