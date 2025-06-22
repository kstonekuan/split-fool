<script lang="ts">
import { navigateToGroup } from "../utils/routing";
import { formatGroupCode, validateGroupCode } from "../utils/validation";

// biome-ignore lint/style/useConst: This needs to be mutable for binding
let groupCode = "";
let error = "";

function handleJoinGroup() {
	const validation = validateGroupCode(groupCode);
	if (!validation.isValid) {
		error = validation.error || "";
		return;
	}

	navigateToGroup(formatGroupCode(groupCode));
}
</script>

<div class="card mt-4">
  <h2 class="text-xl font-bold mb-4">Join Existing Group</h2>
  
  <form on:submit|preventDefault={handleJoinGroup}>
    <div class="mb-4">
      <label for="groupCode" class="label">Group Code</label>
      <input
        id="groupCode"
        type="text"
        class="input"
        bind:value={groupCode}
        placeholder="Enter 6-character code"
        maxlength="6"
        style="text-transform: uppercase"
      />
      {#if error}
        <p class="error">{error}</p>
      {/if}
    </div>

    <button type="submit" class="btn btn-secondary">
      Join Group
    </button>
  </form>
</div>