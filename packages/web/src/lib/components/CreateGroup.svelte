<script lang="ts">
import { api } from "../api/client";
import { getErrorMessage } from "../utils/error-handling";
import { navigateToGroup } from "../utils/routing";
import { validateGroupName } from "../utils/validation";

let groupName = "";
let loading = false;
let error = "";

async function handleCreateGroup() {
	const validation = validateGroupName(groupName);
	if (!validation.isValid) {
		error = validation.error || "";
		return;
	}

	loading = true;
	error = "";

	try {
		const response = await api.createGroup({ name: groupName });
		navigateToGroup(response.group.code);
	} catch (err) {
		error = getErrorMessage(err);
	} finally {
		loading = false;
	}
}
</script>

<div class="card">
  <h2 class="text-lg font-bold mb-3 sm:text-xl sm:mb-4">Create a New Group</h2>
  
  <form on:submit|preventDefault={handleCreateGroup}>
    <div class="mb-4">
      <label for="groupName" class="label">Group Name</label>
      <input
        id="groupName"
        type="text"
        class="input"
        bind:value={groupName}
        placeholder="Enter group name"
        disabled={loading}
      />
      {#if error}
        <p class="error">{error}</p>
      {/if}
    </div>

    <button type="submit" class="btn btn-primary" disabled={loading}>
      {loading ? "Creating..." : "Create Group"}
    </button>
  </form>
</div>