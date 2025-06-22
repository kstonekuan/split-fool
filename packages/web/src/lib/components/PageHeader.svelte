<script lang="ts">
export let title: string;
export let onBack: (() => void) | undefined = undefined;
</script>

<div class="bg-white border-b border-gray-200 mb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3">
  <div class="flex items-center gap-3">
    {#if onBack}
      <button
        class="p-1 text-gray-500 hover:text-gray-700 transition-colors"
        on:click={onBack}
        title="Go back"
        aria-label="Go back"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
    {/if}
    <h2 class="text-xl font-semibold">{title}</h2>
  </div>
</div>