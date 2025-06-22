<script lang="ts">
import { onMount } from "svelte";
import { api } from "./lib/api/client";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import CreateGroup from "./lib/components/CreateGroup.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import ExpensesPage from "./lib/components/ExpensesPage.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import GroupHeader from "./lib/components/GroupHeader.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import JoinGroup from "./lib/components/JoinGroup.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import MembersManage from "./lib/components/MembersManage.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import NavigationHeader from "./lib/components/NavigationHeader.svelte";
// biome-ignore lint/correctness/noUnusedImports: These components are used in the template
import OverviewPage from "./lib/components/OverviewPage.svelte";
import Toast from "./lib/components/Toast.svelte";
import { currentGroup, error, loading } from "./lib/stores/group";
import { toast } from "./lib/stores/toast";
import { getErrorMessage, isNotFoundError } from "./lib/utils/error-handling";
import { extractGroupCodeFromPath, redirectToHome } from "./lib/utils/routing";

let groupCode: string | null = null;
let currentPage: "overview" | "expenses" | "members" = "overview";

function navigateTo(page: "overview" | "expenses" | "members") {
	currentPage = page;
}

onMount(() => {
	// Check if we have a group code in the URL
	groupCode = extractGroupCodeFromPath(window.location.pathname);
	if (groupCode) {
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
		const errorMessage = getErrorMessage(err);
		error.set(errorMessage);
		// If group not found, redirect to home
		if (isNotFoundError(err)) {
			redirectToHome(2000);
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
    
    <NavigationHeader currentPage={currentPage} onNavigate={navigateTo} />
    
    {#if currentPage === 'members'}
      <MembersManage
        members={$currentGroup.members}
        groupCode={$currentGroup.group.code}
        onRefresh={loadGroup}
      />
    {:else if currentPage === 'expenses'}
      <ExpensesPage
        expenses={$currentGroup.expenses}
        members={$currentGroup.members}
        groupCode={$currentGroup.group.code}
        onRefresh={loadGroup}
      />
    {:else}
      <OverviewPage
        balances={$currentGroup.balances}
        settlements={$currentGroup.settlements}
        members={$currentGroup.members}
      />
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
