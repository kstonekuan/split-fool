<script lang="ts">
export let currentPage: "overview" | "expenses" | "members" = "overview";
export let onNavigate: (page: "overview" | "expenses" | "members") => void;

const tabs = [
	{ id: "overview", label: "Overview" },
	{ id: "expenses", label: "Expenses" },
	{ id: "members", label: "Members" },
] as const;
</script>

<div class="bg-white border-b border-gray-200 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
  <nav class="flex space-x-8 px-4 sm:px-6 lg:px-8" aria-label="Tabs">
    {#each tabs as tab}
      <button
        class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {
          currentPage === tab.id
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }"
        on:click={() => onNavigate(tab.id)}
        aria-current={currentPage === tab.id ? 'page' : undefined}
      >
        {tab.label}
      </button>
    {/each}
  </nav>
</div>