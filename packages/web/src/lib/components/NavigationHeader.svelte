<script lang="ts">
export let currentPage: "overview" | "expenses" | "members" = "overview";
export let onNavigate: (page: "overview" | "expenses" | "members") => void;

const tabs = [
	{ id: "overview", label: "Overview" },
	{ id: "expenses", label: "Expenses" },
	{ id: "members", label: "Members" },
] as const;
</script>

<div class="bg-white border-b border-gray-200 mb-4 -mx-4 sm:mb-6">
  <nav class="flex space-x-1 px-2 sm:space-x-8 sm:px-4" aria-label="Tabs">
    {#each tabs as tab}
      <button
        class="flex-1 py-3 px-2 border-b-2 font-medium text-sm transition-colors sm:flex-initial sm:py-4 sm:px-1 {
          currentPage === tab.id
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 active:text-gray-700'
        }"
        on:click={() => onNavigate(tab.id)}
        aria-current={currentPage === tab.id ? 'page' : undefined}
      >
        {tab.label}
      </button>
    {/each}
  </nav>
</div>