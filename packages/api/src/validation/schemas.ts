import { z } from "zod";

// Group schemas
export const createGroupSchema = z.object({
	name: z.string().trim().min(1, "Group name is required"),
});

// Member schemas
export const createMemberSchema = z.object({
	name: z.string().trim().min(1, "Member name is required"),
});

// Expense schemas
export const createExpenseSchema = z
	.object({
		payerId: z.string().min(1, "Payer ID is required"),
		amount: z.number().positive("Amount must be positive"),
		description: z.string().trim().min(1, "Description is required"),
		date: z.string().optional(),
		splits: z
			.array(
				z.object({
					memberId: z.string().min(1, "Member ID is required"),
					amount: z.number().positive("Split amount must be positive"),
				}),
			)
			.min(1, "At least one split is required")
			.refine(
				(splits) => {
					// Validate that all splits have unique member IDs
					const memberIds = splits.map((s) => s.memberId);
					return memberIds.length === new Set(memberIds).size;
				},
				{ message: "Each member can only have one split" },
			),
	})
	.refine(
		(data) => {
			// Validate splits sum to total amount
			const totalSplits = data.splits.reduce(
				(sum, split) => sum + split.amount,
				0,
			);
			return Math.abs(totalSplits - data.amount) < 0.01;
		},
		{ message: "Splits must sum to total amount" },
	);

// Path parameter schemas
export const groupCodeSchema = z.object({
	code: z.string().min(1, "Group code is required"),
});

export const memberIdSchema = z.object({
	memberId: z.string().min(1, "Member ID is required"),
});

export const expenseIdSchema = z.object({
	expenseId: z.string().min(1, "Expense ID is required"),
});
