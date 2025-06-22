<script lang="ts">
import { onMount } from "svelte";

export let message = "";
export let type: "success" | "error" | "info" = "info";
export let duration = 3000;

let visible = true;

onMount(() => {
	const timer = setTimeout(() => {
		visible = false;
	}, duration);

	return () => clearTimeout(timer);
});
</script>

{#if visible}
<div class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 px-6 flex items-center gap-3 z-[1100] transition-all duration-300 {visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'} border-l-4 {type === 'success' ? 'border-success' : type === 'error' ? 'border-danger' : 'border-primary'}">
	<div class="flex items-center gap-3">
		{#if type === "success"}
			<svg class="w-5 h-5 text-success flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
			</svg>
		{:else if type === "error"}
			<svg class="w-5 h-5 text-danger flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
			</svg>
		{:else}
			<svg class="w-5 h-5 text-primary flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
			</svg>
		{/if}
		<span class="text-gray-800">{message}</span>
	</div>
</div>
{/if}