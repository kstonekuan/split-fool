<script lang="ts">
import type { Group } from "@split-fool/shared";

export let group: Group;

let copied = false;

function handleCopyCode() {
	navigator.clipboard.writeText(group.code);
	copied = true;
	setTimeout(() => {
		copied = false;
	}, 2000);
}
</script>

<div class="card mb-4">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-bold">{group.name}</h1>
      <div class="flex items-center gap-2 mt-2">
        <span class="text-secondary">Group Code:</span>
        <code class="font-bold text-lg">{group.code}</code>
        <button 
          class="p-1 text-gray-500 hover:text-gray-700 transition-colors" 
          on:click={handleCopyCode}
          title="Copy code"
        >
          {#if copied}
            <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          {/if}
        </button>
      </div>
    </div>
    <a href="/" class="btn btn-secondary">
      Back to Home
    </a>
  </div>
</div>