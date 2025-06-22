<script lang="ts">
import type { ExpenseWithSplits, Member } from "@split-fool/shared";
import AddExpense from "./AddExpense.svelte";
import ExpensesList from "./ExpensesList.svelte";

export let expenses: ExpenseWithSplits[];
export let members: Member[];
export let groupCode: string;
export let onRefresh: (() => void) | undefined = undefined;
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <AddExpense
    members={members}
    groupCode={groupCode}
    onRefresh={onRefresh}
  />
  
  <ExpensesList
    expenses={expenses}
    members={members}
    groupCode={groupCode}
    onRefresh={onRefresh}
  />
</div>