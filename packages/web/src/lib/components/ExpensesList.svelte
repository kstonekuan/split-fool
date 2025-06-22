<script lang="ts">
import type { ExpenseWithSplits, Member } from "@split-fool/shared";
import { api } from "../api/client";
import { toast } from "../stores/toast";
import { getErrorMessage } from "../utils/error-handling";
import { formatDate, getMemberName } from "../utils/formatters";
import Modal from "./Modal.svelte";

export let expenses: ExpenseWithSplits[];
export let members: Member[];
export let groupCode: string;
export let onRefresh: (() => void) | undefined = undefined;

// Sort expenses by date, then by creation time, then by id (newest first)
$: sortedExpenses = [...expenses].sort((a, b) => {
	// First sort by date (the expense date, not creation time)
	const expenseDateA = new Date(a.date).getTime();
	const expenseDateB = new Date(b.date).getTime();
	if (expenseDateA !== expenseDateB) {
		return expenseDateB - expenseDateA;
	}

	// Then sort by creation timestamp (includes time)
	const createdAtA = new Date(a.createdAt).getTime();
	const createdAtB = new Date(b.createdAt).getTime();
	if (createdAtA !== createdAtB) {
		return createdAtB - createdAtA;
	}

	// Finally use id as tiebreaker (lexicographic order, reversed)
	return b.id.localeCompare(a.id);
});

let showDeleteModal = false;
let expenseToDelete: string | null = null;
let showErrorModal = false;
let errorMessage = "";
let expandedExpenseId: string | null = null;

function confirmDelete(expenseId: string) {
	expenseToDelete = expenseId;
	showDeleteModal = true;
}

function toggleExpense(expenseId: string) {
	if (expandedExpenseId === expenseId) {
		expandedExpenseId = null;
	} else {
		expandedExpenseId = expenseId;
	}
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
  <h2 class="text-lg font-bold mb-3 sm:text-xl sm:mb-4">Expenses</h2>

  {#if expenses.length === 0}
    <p class="text-gray-500 text-sm sm:text-base">No expenses yet.</p>
  {:else}
    <div class="flex flex-col gap-2">
      {#each sortedExpenses as expense}
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <button
            class="w-full p-4 text-left hover:bg-gray-50 active:bg-gray-50 transition-colors min-h-[60px] sm:p-3"
            on:click={() => toggleExpense(expense.id)}
          >
            <div class="flex justify-between items-start gap-3">
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm sm:text-base truncate">{expense.description}</p>
                <p class="text-gray-600 text-xs mt-1 sm:text-sm">
                  {getMemberName(expense.payerId, members)} paid
                </p>
                <p class="text-gray-900 font-medium text-sm mt-0.5 sm:text-base">${expense.amount.toFixed(2)}</p>
                <p class="text-gray-500 text-xs mt-1 sm:text-sm">{formatDate(expense.date)}</p>
              </div>
              <div class="flex items-center p-1">
                <svg 
                  class="w-5 h-5 text-gray-400 transition-transform {expandedExpenseId === expense.id ? 'rotate-180' : ''}"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>
          
          {#if expandedExpenseId === expense.id}
            <div class="border-t border-gray-200 bg-gray-50 p-4 sm:p-3">
              <h4 class="font-semibold text-sm mb-3 sm:mb-2">Split Details:</h4>
              <div class="space-y-2 mb-3 sm:space-y-1">
                {#each expense.splits as split}
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-700">{getMemberName(split.memberId, members)}</span>
                    <span class="font-medium font-mono">${split.amount.toFixed(2)}</span>
                  </div>
                {/each}
              </div>
              <div class="text-xs text-gray-500 border-t pt-3 sm:pt-2">
                Total: ${expense.amount.toFixed(2)} paid by {getMemberName(expense.payerId, members)}
              </div>
              <div class="mt-4 pt-4 border-t border-gray-200 sm:mt-3 sm:pt-3">
                <button
                  class="btn btn-danger btn-small w-full sm:w-auto"
                  on:click|stopPropagation={() => confirmDelete(expense.id)}
                >
                  Delete Expense
                </button>
              </div>
            </div>
          {/if}
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