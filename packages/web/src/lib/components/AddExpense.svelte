<script lang="ts">
import type { Member } from "@split-fool/shared";
import { api } from "../api/client";
import { toast } from "../stores/toast";
import type { CustomSplits } from "../types";
import { getErrorMessage } from "../utils/error-handling";
import {
	calculateEqualSplitsWithMembers,
	calculateRandomSplitsWithMembers,
	parseSplitAmounts,
	validateCustomSplits,
	validateExpenseForm,
} from "../utils/expense-calculations";
import { updateCustomSplitsForMembers } from "../utils/state-helpers";

export let members: Member[];
export let groupCode: string;
export let onRefresh: (() => void) | undefined = undefined;

// Sort members alphabetically
$: sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));

let payerId = "";
let amount = "";
let description = "";
let splitType: "equal" | "random" | "custom" = "equal";
let customSplits: CustomSplits = {};
let loading = false;
let error = "";

// Initialize custom splits
$: if (members.length > 0) {
	customSplits = updateCustomSplitsForMembers(customSplits, members);
}

async function handleAddExpense() {
	error = "";

	// Validate form inputs
	const validation = validateExpenseForm(payerId, amount, description);
	if (!validation.isValid) {
		error = validation.error || "";
		return;
	}

	const totalAmount = parseFloat(amount);
	let splits: Array<{ memberId: string; amount: number }> = [];

	if (splitType === "equal") {
		splits = calculateEqualSplitsWithMembers(totalAmount, members);
	} else if (splitType === "random") {
		splits = calculateRandomSplitsWithMembers(totalAmount, members);
	} else {
		const customValidation = validateCustomSplits(customSplits, totalAmount);
		if (!customValidation.isValid) {
			error = customValidation.error || "";
			return;
		}
		splits = parseSplitAmounts(customSplits);
	}

	loading = true;

	try {
		await api.createExpense(groupCode, {
			payerId,
			amount: totalAmount,
			description,
			splits,
		});

		// Reset form
		payerId = "";
		amount = "";
		description = "";
		splitType = "equal";
		customSplits = {};

		toast.success("Expense added successfully");
		onRefresh?.();
	} catch (err) {
		error = getErrorMessage(err);
	} finally {
		loading = false;
	}
}
</script>

<div class="card">
  <h2 class="text-xl font-bold mb-4">Add Expense</h2>

  {#if members.length < 2}
    <p class="text-gray-500">Add at least 2 members to start tracking expenses.</p>
  {:else}
    <form on:submit|preventDefault={handleAddExpense}>
      <div class="mb-4">
        <label for="payer" class="label">Who Paid?</label>
        <select id="payer" class="input" bind:value={payerId} disabled={loading}>
          <option value="">Select member</option>
          {#each sortedMembers as member}
            <option value={member.id}>{member.name}</option>
          {/each}
        </select>
      </div>

      <div class="mb-4">
        <label for="amount" class="label">Amount</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          class="input"
          bind:value={amount}
          placeholder="0.00"
          disabled={loading}
        />
      </div>

      <div class="mb-4">
        <label for="description" class="label">Description</label>
        <input
          id="description"
          type="text"
          class="input"
          bind:value={description}
          placeholder="What was this expense for?"
          disabled={loading}
        />
      </div>

      <div class="mb-4">
        <fieldset>
          <legend class="label">Split Type</legend>
          <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <label class="flex items-center gap-2 p-2 -m-2 cursor-pointer">
            <input
              type="radio"
              bind:group={splitType}
              value="equal"
              disabled={loading}
              class="w-4 h-4"
            />
            <span class="text-sm sm:text-base">Split Equally</span>
          </label>
          <label class="flex items-center gap-2 p-2 -m-2 cursor-pointer">
            <input
              type="radio"
              bind:group={splitType}
              value="random"
              disabled={loading}
              class="w-4 h-4"
            />
            <span class="text-sm sm:text-base">Random Split</span>
          </label>
          <label class="flex items-center gap-2 p-2 -m-2 cursor-pointer">
            <input
              type="radio"
              bind:group={splitType}
              value="custom"
              disabled={loading}
              class="w-4 h-4"
            />
            <span class="text-sm sm:text-base">Custom Split</span>
          </label>
          </div>
        </fieldset>
      </div>

      {#if splitType === "random" && amount}
        <div class="mb-4">
          <p class="label">Random Split Info</p>
          <p class="text-sm text-gray-600">
            The expense will be randomly split among all members. Each member will get a random portion of the total amount.
          </p>
        </div>
      {/if}

      {#if splitType === "custom"}
        <div class="mb-4">
          <p class="label">Custom Amounts</p>
          <div class="space-y-3">
            {#each sortedMembers as member}
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span class="text-sm font-medium sm:w-32">{member.name}:</span>
                <input
                  type="number"
                  step="0.01"
                  class="input flex-1 sm:max-w-[150px]"
                  bind:value={customSplits[member.id]}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if error}
        <p class="error mb-4">{error}</p>
      {/if}

      <button type="submit" class="btn btn-primary" disabled={loading}>
        {loading ? "Adding..." : "Add Expense"}
      </button>
    </form>
  {/if}
</div>