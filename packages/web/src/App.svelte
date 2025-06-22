<script lang="ts">
import { onMount } from "svelte";
import { api } from "./lib/api/client";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import AddExpense from "./lib/components/AddExpense.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import Balances from "./lib/components/Balances.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import CreateGroup from "./lib/components/CreateGroup.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import ExpensesList from "./lib/components/ExpensesList.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import GroupHeader from "./lib/components/GroupHeader.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import JoinGroup from "./lib/components/JoinGroup.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import MembersList from "./lib/components/MembersList.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import MembersView from "./lib/components/MembersView.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import MembersManage from "./lib/components/MembersManage.svelte";
import Toast from "./lib/components/Toast.svelte";
import { currentGroup, error, loading } from "./lib/stores/group";
import { toast } from "./lib/stores/toast";

let groupCode: string | null = null;
let showMembersManage = false;

onMount(() => {
	// Check if we have a group code in the URL
	const path = window.location.pathname.slice(1);
	if (path && path.length === 6) {
		groupCode = path.toUpperCase();
		loadGroup();
	}
});

async function loadGroup() {
	if (!groupCode) {
		return;
	}

	loading.set(true);
	error.set(null);

	try {
		const data = await api.getGroup(groupCode);
		currentGroup.set(data);
	} catch (err) {
		error.set(err instanceof Error ? err.message : "Failed to load group");
		// If group not found, redirect to home
		if (err instanceof Error && err.message.includes("not found")) {
			setTimeout(() => {
				window.location.href = "/";
			}, 2000);
		}
	} finally {
		loading.set(false);
	}
}
</script>

<div class="container">
  {#if $loading}
    <div class="text-center mt-4">
      <p class="text-gray-600">Loading...</p>
    </div>
  {:else if $error}
    <div class="card mt-4">
      <p class="error">{$error}</p>
      <a href="/" class="btn btn-secondary mt-4">Back to Home</a>
    </div>
  {:else if $currentGroup}
    <GroupHeader group={$currentGroup.group} />
    
    {#if showMembersManage}
      <MembersManage
        members={$currentGroup.members}
        groupCode={$currentGroup.group.code}
        on:refresh={loadGroup}
        onBack={() => showMembersManage = false}
      />
    {:else}
      <MembersView
        members={$currentGroup.members}
        onEdit={() => showMembersManage = true}
      />
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <AddExpense
          members={$currentGroup.members}
          groupCode={$currentGroup.group.code}
          on:refresh={loadGroup}
        />
        
        <ExpensesList
          expenses={$currentGroup.expenses}
          members={$currentGroup.members}
          groupCode={$currentGroup.group.code}
          on:refresh={loadGroup}
        />
        
        <Balances
          balances={$currentGroup.balances}
          settlements={$currentGroup.settlements}
        />
      </div>
    {/if}
  {:else}
    <div class="text-center mt-4">
      <h1 class="text-2xl font-bold mb-4">Welcome to SplitFool</h1>
      <p class="text-gray-600 mb-4">Track and split expenses with your group</p>
    </div>
    
    <CreateGroup />
    <JoinGroup />
  {/if}
</div>

{#each $toast as toastMessage (toastMessage.id)}
  <Toast
    message={toastMessage.message}
    type={toastMessage.type}
    duration={toastMessage.duration}
  />
{/each}
