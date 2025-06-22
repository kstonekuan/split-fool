<script lang="ts">
import { onMount } from "svelte";
import { api } from "./lib/api/client";
import CreateGroup from "./lib/components/CreateGroup.svelte";
import ExpensesPage from "./lib/components/ExpensesPage.svelte";
import GroupHeader from "./lib/components/GroupHeader.svelte";
import JoinGroup from "./lib/components/JoinGroup.svelte";
import MembersManage from "./lib/components/MembersManage.svelte";
import NavigationHeader from "./lib/components/NavigationHeader.svelte";
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
        groupCode={$currentGroup.group.code}
        onRefresh={loadGroup}
      />
    {/if}
  {:else}
    <div class="text-center mt-8 px-4 sm:mt-4">
      <h1 class="text-2xl font-bold mb-3 sm:text-3xl sm:mb-4">Welcome to SplitFool</h1>
      <p class="text-gray-600 mb-6 text-sm sm:text-base sm:mb-4">Track and split expenses with your group</p>
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
