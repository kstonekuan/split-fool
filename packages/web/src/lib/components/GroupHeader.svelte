<script lang="ts">
import type { Group } from "@split-fool/shared";

export let group: Group;

function _copyCode() {
	navigator.clipboard.writeText(group.code);
	// In a real app, you'd show a toast notification here
	alert("Code copied to clipboard!");
}
</script>

<div class="card mb-4">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-bold">{group.name}</h1>
      <div class="flex items-center gap-2 mt-2">
        <span class="text-secondary">Group Code:</span>
        <code class="font-bold text-lg">{group.code}</code>
        <button class="btn btn-secondary" on:click={_copyCode} style="padding: 0.25rem 0.5rem;">
          Copy
        </button>
      </div>
    </div>
    <a href="/" class="btn btn-secondary">
      Back to Home
    </a>
  </div>
</div>