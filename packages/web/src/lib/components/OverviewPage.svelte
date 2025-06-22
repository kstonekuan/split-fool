<script lang="ts">
import type { Balance, Member, Settlement } from "@split-fool/shared";
import { api } from "../api/client";
import { getErrorMessage } from "../utils/error-handling";
import { formatCurrency } from "../utils/formatters";
import Balances from "./Balances.svelte";
import Modal from "./Modal.svelte";
import Toast from "./Toast.svelte";

export let balances: Balance[];
export let settlements: Settlement[];
export let members: Member[];
export let groupCode: string;
export let onRefresh: (() => void) | undefined = undefined;

// Sort members alphabetically
$: sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));

let showSettleModal = false;
let showCustomSettleModal = false;
let selectedSettlement: Settlement | null = null;
let settleLoading = false;
let toastMessage = "";
let toastType: "success" | "error" | "info" = "info";
let showToast = false;

// Custom settlement form state
let fromMemberId = "";
let toMemberId = "";
let settleAmount = "";

function handleSettleDebt(settlement: Settlement) {
	selectedSettlement = settlement;
	showSettleModal = true;
}

function handleCustomSettle() {
	// Reset form
	fromMemberId = "";
	toMemberId = "";
	settleAmount = "";
	showCustomSettleModal = true;
}

async function confirmSettleDebt() {
	if (!selectedSettlement) {
		return;
	}

	settleLoading = true;
	showSettleModal = false;

	// Keep a copy of the settlement in case we need to retry
	const settlementToProcess = selectedSettlement;

	try {
		await api.createExpense(groupCode, {
			description: `Settlement: ${settlementToProcess.fromMemberName} → ${settlementToProcess.toMemberName}`,
			amount: settlementToProcess.amount,
			payerId: settlementToProcess.fromMemberId, // The person who owes pays
			splits: [
				{
					memberId: settlementToProcess.toMemberId, // The person who is owed receives
					amount: settlementToProcess.amount,
				},
			],
		});

		toastMessage = "Debt settled successfully!";
		toastType = "success";
		showToast = true;

		// Clear the selection after success
		selectedSettlement = null;

		// Refresh the group data
		onRefresh?.();
	} catch (error) {
		toastMessage = getErrorMessage(error);
		toastType = "error";
		showToast = true;

		// Keep the selection so user can retry
		selectedSettlement = settlementToProcess;
	} finally {
		settleLoading = false;
	}
}

async function confirmCustomSettle() {
	const amount = parseFloat(settleAmount);
	if (!fromMemberId || !toMemberId || !amount || amount <= 0) {
		toastMessage = "Please fill in all fields with valid values";
		toastType = "error";
		showToast = true;
		return;
	}

	if (fromMemberId === toMemberId) {
		toastMessage = "Cannot settle between the same person";
		toastType = "error";
		showToast = true;
		return;
	}

	settleLoading = true;
	showCustomSettleModal = false;

	try {
		const fromMember = members.find((m) => m.id === fromMemberId);
		const toMember = members.find((m) => m.id === toMemberId);

		await api.createExpense(groupCode, {
			description: `Settlement: ${fromMember?.name} → ${toMember?.name}`,
			amount: amount,
			payerId: fromMemberId, // The person who pays
			splits: [
				{
					memberId: toMemberId, // The person who receives
					amount: amount,
				},
			],
		});

		toastMessage = "Settlement recorded successfully!";
		toastType = "success";
		showToast = true;

		onRefresh?.();
	} catch (error) {
		toastMessage = getErrorMessage(error);
		toastType = "error";
		showToast = true;
	} finally {
		settleLoading = false;
	}
}
</script>

<Balances
  balances={balances}
  settlements={settlements}
  onSettleDebt={handleSettleDebt}
  onCustomSettle={handleCustomSettle}
/>

<Modal
  show={showSettleModal}
  title="Confirm Settlement"
  message={selectedSettlement ? `Settle ${selectedSettlement.fromMemberName}'s debt of ${formatCurrency(selectedSettlement.amount)} to ${selectedSettlement.toMemberName}?` : ""}
  type="confirm"
  confirmText="Settle"
  cancelText="Cancel"
  onConfirm={confirmSettleDebt}
  onCancel={() => { showSettleModal = false; selectedSettlement = null; }}
/>

{#if showCustomSettleModal}
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[1000] animate-fadeIn sm:items-center">
	<div class="bg-white rounded-t-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto animate-slideUp sm:rounded-lg sm:w-[90%] sm:animate-slideIn">
		<div class="p-4 border-b border-gray-200 sm:p-6">
			<h3 class="text-lg font-semibold text-gray-900 sm:text-xl">Record Settlement</h3>
		</div>
		<div class="p-4 sm:p-6">
			<div class="space-y-4">
				<div>
					<label for="from-member" class="label">Who paid?</label>
					<select
						id="from-member"
						class="input"
						bind:value={fromMemberId}
					>
						<option value="">Select member</option>
						{#each sortedMembers as member}
							<option value={member.id}>{member.name}</option>
						{/each}
					</select>
				</div>
				
				<div>
					<label for="to-member" class="label">Who received?</label>
					<select
						id="to-member"
						class="input"
						bind:value={toMemberId}
					>
						<option value="">Select member</option>
						{#each sortedMembers as member}
							<option value={member.id}>{member.name}</option>
						{/each}
					</select>
				</div>
				
				<div>
					<label for="amount" class="label">Amount</label>
					<input
						id="amount"
						type="number"
						class="input"
						bind:value={settleAmount}
						placeholder="0.00"
						step="0.01"
						min="0.01"
					/>
				</div>
			</div>
		</div>
		<div class="px-4 py-3 border-t border-gray-200 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
			<button class="btn btn-secondary w-full sm:w-auto" on:click={() => showCustomSettleModal = false}>
				Cancel
			</button>
			<button class="btn btn-primary w-full sm:w-auto" on:click={confirmCustomSettle} disabled={settleLoading}>
				Record Settlement
			</button>
		</div>
	</div>
</div>
{/if}

{#if showToast}
  <Toast
    message={toastMessage}
    type={toastType}
    on:close={() => showToast = false}
  />
{/if}