<script lang="ts">
import { api } from "../api/client";

// biome-ignore lint/style/useConst: This needs to be mutable for binding
let groupName = "";
let _loading = false;
let _error = "";

async function _createGroup() {
	if (!groupName.trim()) {
		_error = "Group name is required";
		return;
	}

	_loading = true;
	_error = "";

	try {
		const response = await api.createGroup({ name: groupName });
		window.location.href = `/${response.group.code}`;
	} catch (err) {
		_error = err instanceof Error ? err.message : "Failed to create group";
	} finally {
		_loading = false;
	}
}
</script>

<div class="card">
  <h2 class="text-xl font-bold mb-4">Create a New Group</h2>
  
  <form on:submit|preventDefault={_createGroup}>
    <div class="mb-4">
      <label for="groupName" class="label">Group Name</label>
      <input
        id="groupName"
        type="text"
        class="input"
        bind:value={groupName}
        placeholder="Enter group name"
        disabled={_loading}
      />
      {#if _error}
        <p class="error">{_error}</p>
      {/if}
    </div>

    <button type="submit" class="btn btn-primary" disabled={_loading}>
      {_loading ? "Creating..." : "Create Group"}
    </button>
  </form>
</div>