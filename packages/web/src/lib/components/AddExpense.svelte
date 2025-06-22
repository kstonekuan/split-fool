<script lang="ts">
import type { Member } from "@split-fool/shared";
import { createEventDispatcher } from "svelte";
import { api } from "../api/client";
import { toast } from "../stores/toast";

export let members: Member[];
export let groupCode: string;

const dispatch = createEventDispatcher();

let payerId = "";
let amount = "";
let description = "";
let splitType: "equal" | "custom" = "equal";
let customSplits: { [memberId: string]: string } = {};
let _loading = false;
let _error = "";

// Initialize custom splits
$: if (members.length > 0) {
	members.forEach((member) => {
		if (!customSplits[member.id]) {
			customSplits[member.id] = "";
		}
	});
}

async function _addExpense() {
	_error = "";

	if (!payerId) {
		_error = "Please select who paid";
		return;
	}

	if (!amount || parseFloat(amount) <= 0) {
		_error = "Please enter a valid amount";
		return;
	}

	if (!description.trim()) {
		_error = "Please enter a description";
		return;
	}

	const totalAmount = parseFloat(amount);
	let splits: Array<{ memberId: string; amount: number }> = [];

	if (splitType === "equal") {
		const splitAmount = totalAmount / members.length;
		splits = members.map((member) => ({
			memberId: member.id,
			amount: Math.round(splitAmount * 100) / 100,
		}));
	} else {
		splits = [];
		let totalSplit = 0;

		for (const [memberId, splitAmount] of Object.entries(customSplits)) {
			const parsedAmount = parseFloat(splitAmount) || 0;
			if (parsedAmount > 0) {
				splits.push({
					memberId,
					amount: parsedAmount,
				});
				totalSplit += parsedAmount;
			}
		}

		if (Math.abs(totalSplit - totalAmount) > 0.01) {
			_error = `Splits must sum to ${totalAmount.toFixed(2)} (currently: ${totalSplit.toFixed(2)})`;
			return;
		}
	}

	_loading = true;

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
		dispatch("refresh");
	} catch (err) {
		_error = err instanceof Error ? err.message : "Failed to add expense";
	} finally {
		_loading = false;
	}
}
</script>

<div class="card">
  <h2 class="text-xl font-bold mb-4">Add Expense</h2>

  {#if members.length < 2}
    <p class="text-gray-500">Add at least 2 members to start tracking expenses.</p>
  {:else}
    <form on:submit|preventDefault={_addExpense}>
      <div class="mb-4">
        <label for="payer" class="label">Who Paid?</label>
        <select id="payer" class="input" bind:value={payerId} disabled={_loading}>
          <option value="">Select member</option>
          {#each members as member}
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
          disabled={_loading}
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
          disabled={_loading}
        />
      </div>

      <div class="mb-4">
        <label class="label">Split Type</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2">
            <input
              type="radio"
              bind:group={splitType}
              value="equal"
              disabled={_loading}
            />
            Split Equally
          </label>
          <label class="flex items-center gap-2">
            <input
              type="radio"
              bind:group={splitType}
              value="custom"
              disabled={_loading}
            />
            Custom Split
          </label>
        </div>
      </div>

      {#if splitType === "custom"}
        <div class="mb-4">
          <label class="label">Custom Amounts</label>
          {#each members as member}
            <div class="flex items-center gap-2 mb-2">
              <span style="width: 150px;">{member.name}:</span>
              <input
                type="number"
                step="0.01"
                class="input"
                bind:value={customSplits[member.id]}
                placeholder="0.00"
                disabled={_loading}
                style="width: 150px;"
              />
            </div>
          {/each}
        </div>
      {/if}

      {#if _error}
        <p class="error mb-4">{_error}</p>
      {/if}

      <button type="submit" class="btn btn-primary" disabled={_loading}>
        {_loading ? "Adding..." : "Add Expense"}
      </button>
    </form>
  {/if}
</div>