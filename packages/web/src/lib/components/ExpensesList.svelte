<script lang="ts">
import type { Expense, Member } from "@split-fool/shared";
import { api } from "../api/client";
import { toast } from "../stores/toast";
import { getErrorMessage } from "../utils/error-handling";
import { formatDate, getMemberName } from "../utils/formatters";
import Modal from "./Modal.svelte";

export let expenses: Expense[];
export let members: Member[];
export let groupCode: string;
export let onRefresh: (() => void) | undefined = undefined;

let showDeleteModal = false;
let expenseToDelete: string | null = null;
let showErrorModal = false;
let errorMessage = "";

function confirmDelete(expenseId: string) {
	expenseToDelete = expenseId;
	showDeleteModal = true;
}

async function handleDeleteExpense() {
	if (!expenseToDelete) return;

	try {
		await api.deleteExpense(groupCode, expenseToDelete);
		toast.success("Expense deleted successfully");
		onRefresh?.();
	} catch (err) {
		errorMessage = getErrorMessage(err);
		showErrorModal = true;
	} finally {
		expenseToDelete = null;
		showDeleteModal = false;
	}
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
                Paid by {getMemberName(expense.payerId, members)} • ${expense.amount.toFixed(2)}
              </p>
              <p class="text-gray-600 text-sm">{formatDate(expense.date)}</p>
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
	onConfirm={handleDeleteExpense}
	onCancel={() => showDeleteModal = false}
/>

<Modal
	show={showErrorModal}
	title="Error"
	message={errorMessage}
	type="error"
	onConfirm={() => showErrorModal = false}
/>