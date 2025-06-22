<script lang="ts">
import type { Member } from "@split-fool/shared";

export let members: Member[];
export let onEdit: () => void;
</script>

<div class="card">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-bold">Members ({members.length})</h2>
    <button class="btn btn-primary" on:click={onEdit}>
      Manage Members
    </button>
  </div>

  {#if members.length === 0}
    <p class="text-gray-500">No members yet.</p>
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {#each members as member}
        <div class="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5">
          <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <span class="text-center text-sm">{member.name}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>