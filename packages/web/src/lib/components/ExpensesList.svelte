<script lang="ts">
import type { Expense, Member } from "@split-fool/shared";
import { createEventDispatcher } from "svelte";
import { api } from "../api/client";
import Modal from "./Modal.svelte";
import { toast } from "../stores/toast";

export let expenses: Expense[];
export let members: Member[];
export let groupCode: string;

const dispatch = createEventDispatcher();

let showDeleteModal = false;
let expenseToDelete: string | null = null;
let showErrorModal = false;
let errorMessage = "";

function _getMemberName(memberId: string): string {
	return members.find((m) => m.id === memberId)?.name || "Unknown";
}

function confirmDelete(expenseId: string) {
	expenseToDelete = expenseId;
	showDeleteModal = true;
}

async function _deleteExpense() {
	if (!expenseToDelete) return;

	try {
		await api.deleteExpense(groupCode, expenseToDelete);
		toast.success("Expense deleted successfully");
		dispatch("refresh");
	} catch (err) {
		errorMessage = err instanceof Error ? err.message : "Failed to delete expense";
		showErrorModal = true;
	} finally {
		expenseToDelete = null;
		showDeleteModal = false;
	}
}

function _formatDate(dateString: string): string {
	// Handle both full ISO dates and YYYY-MM-DD format
	const date = new Date(dateString);
	if (isNaN(date.getTime())) {
		// If invalid date, try parsing YYYY-MM-DD format
		const [year, month, day] = dateString.split('-').map(Number);
		return new Date(year, month - 1, day).toLocaleDateString();
	}
	return date.toLocaleDateString();
}
</script>

<div class="card">
  <h2 class="text-xl font-bold mb-4">Expenses</h2>

  {#if expenses.length === 0}
    <p class="text-gray-500">No expenses yet.</p>
  {:else}
    <div class="flex flex-col gap-2">
      {#each expenses as expense}
        <div class="border border-gray-200 rounded-lg p-3">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-bold">{expense.description}</p>
              <p class="text-gray-600 text-sm">
                Paid by {_getMemberName(expense.payerId)} • ${expense.amount.toFixed(2)}
              </p>
              <p class="text-gray-600 text-sm">{_formatDate(expense.date)}</p>
            </div>
            <button
              class="btn btn-danger btn-small"
              on:click={() => confirmDelete(expense.id)}
            >
              Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<Modal
	show={showDeleteModal}
	title="Delete Expense"
	message="Are you sure you want to delete this expense?"
	type="confirm"
	confirmText="Delete"
	cancelText="Cancel"
	on:confirm={_deleteExpense}
	on:cancel={() => showDeleteModal = false}
/>

<Modal
	show={showErrorModal}
	title="Error"
	message={errorMessage}
	type="error"
	on:confirm={() => showErrorModal = false}
/>