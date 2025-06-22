<script lang="ts">
import type { Balance, Settlement } from "@split-fool/shared";
import { formatBalance, formatCurrency } from "../utils/formatters";

export let balances: Balance[];
export let settlements: Settlement[];
</script>

<div class="card">
  <h2 class="text-lg font-bold mb-3 sm:text-xl sm:mb-4">Balances</h2>

  {#if balances.length === 0}
    <p class="text-secondary text-sm sm:text-base">No balances to show.</p>
  {:else}
    <div class="mb-4">
      <h3 class="font-semibold mb-3 text-sm sm:text-base">Individual Balances</h3>
      <div class="-mx-2 sm:mx-0">
        {#each balances as balance}
          <div class="flex justify-between items-center py-3 px-2 border-b sm:py-2">
            <span class="text-sm font-medium sm:text-base">{balance.memberName}</span>
            <span class="text-sm font-semibold sm:text-base" class:text-green-600={formatBalance(balance.balance).isPositive} class:text-red-600={balance.balance < 0}>
              {formatBalance(balance.balance).amount}
              <span class="text-xs sm:text-sm">{formatBalance(balance.balance).status}</span>
            </span>
          </div>
        {/each}
      </div>
    </div>

    {#if settlements.length > 0}
      <div>
        <h3 class="font-semibold mb-3 text-sm sm:text-base">Simplified Settlements</h3>
        <div class="-mx-2 sm:mx-0">
          {#each settlements as settlement}
            <div class="py-3 px-2 border-b text-sm sm:py-2 sm:text-base">
              <span class="font-medium">{settlement.fromMemberName}</span>
              <span class="text-secondary"> owes </span>
              <span class="font-medium">{settlement.toMemberName}</span>
              <span class="font-bold text-primary"> {formatCurrency(settlement.amount)}</span>
            </div>
          {/each}
        </div>
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