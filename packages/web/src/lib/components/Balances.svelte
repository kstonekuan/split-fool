<script lang="ts">
import type { Balance, Settlement } from "@split-fool/shared";

export let balances: Balance[];
export let settlements: Settlement[];
</script>

<div class="card">
  <h2 class="text-xl font-bold mb-4">Balances</h2>

  {#if balances.length === 0}
    <p class="text-secondary">No balances to show.</p>
  {:else}
    <div class="mb-4">
      <h3 class="font-bold mb-2">Individual Balances</h3>
      {#each balances as balance}
        <div class="flex justify-between items-center py-2 border-b">
          <span>{balance.memberName}</span>
          <span class:text-green-600={balance.balance > 0} class:text-red-600={balance.balance < 0}>
            ${Math.abs(balance.balance).toFixed(2)}
            {balance.balance > 0 ? "(to receive)" : balance.balance < 0 ? "(to pay)" : ""}
          </span>
        </div>
      {/each}
    </div>

    {#if settlements.length > 0}
      <div>
        <h3 class="font-bold mb-2">Simplified Settlements</h3>
        {#each settlements as settlement}
          <div class="py-2 border-b">
            <span class="font-medium">{settlement.fromMemberName}</span>
            <span class="text-secondary"> owes </span>
            <span class="font-medium">{settlement.toMemberName}</span>
            <span class="font-bold text-primary"> ${settlement.amount.toFixed(2)}</span>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .text-green-600 {
    color: var(--success);
  }
  
  .text-red-600 {
    color: var(--danger);
  }
</style>