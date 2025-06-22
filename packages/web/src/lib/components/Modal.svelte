<script lang="ts">
import { createEventDispatcher } from "svelte";

export let show = false;
export let title = "";
export let message = "";
export let type: "info" | "error" | "confirm" = "info";
export let confirmText = "OK";
export let cancelText = "Cancel";

const dispatch = createEventDispatcher();

function handleConfirm() {
	dispatch("confirm");
	show = false;
}

function handleCancel() {
	dispatch("cancel");
	show = false;
}

function handleBackdropClick(event: MouseEvent) {
	if (event.target === event.currentTarget) {
		handleCancel();
	}
}
</script>

{#if show}
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] animate-fadeIn" on:click={handleBackdropClick}>
	<div class="bg-white rounded-lg shadow-xl max-w-lg w-[90%] max-h-[90vh] overflow-auto animate-slideIn">
		<div class="p-6 border-b border-gray-200">
			<h3 class="text-xl font-semibold text-gray-900">{title}</h3>
		</div>
		<div class="p-6">
			<p class="text-gray-700">{message}</p>
		</div>
		<div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
			{#if type === "confirm"}
				<button class="btn btn-secondary" on:click={handleCancel}>
					{cancelText}
				</button>
				<button class="btn btn-primary" on:click={handleConfirm}>
					{confirmText}
				</button>
			{:else}
				<button class="btn btn-primary" on:click={handleConfirm}>
					{confirmText}
				</button>
			{/if}
		</div>
	</div>
</div>
{/if}

<style>
@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

@keyframes slideIn {
	from {
		transform: translateY(-20px);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
}

.animate-fadeIn {
	animation: fadeIn 0.2s ease-out;
}

.animate-slideIn {
	animation: slideIn 0.2s ease-out;
}
</style>