<script lang="ts">
// biome-ignore lint/style/useConst: This needs to be mutable for binding
let groupCode = "";
let _error = "";

function _joinGroup() {
	if (!groupCode.trim()) {
		_error = "Group code is required";
		return;
	}

	if (groupCode.length !== 6) {
		_error = "Group code must be 6 characters";
		return;
	}

	window.location.href = `/${groupCode.toUpperCase()}`;
}
</script>

<div class="card mt-4">
  <h2 class="text-xl font-bold mb-4">Join Existing Group</h2>
  
  <form on:submit|preventDefault={_joinGroup}>
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
      {#if _error}
        <p class="error">{_error}</p>
      {/if}
    </div>

    <button type="submit" class="btn btn-secondary">
      Join Group
    </button>
  </form>
</div>