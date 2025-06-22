<script lang="ts">
export let show = false;
export let title = "";
export let message = "";
export let type: "info" | "error" | "confirm" = "info";
export let confirmText = "OK";
export let cancelText = "Cancel";
export let onConfirm: (() => void) | undefined = undefined;
export let onCancel: (() => void) | undefined = undefined;

function handleConfirm() {
	onConfirm?.();
}

function handleCancel() {
	onCancel?.();
}

function handleBackdropClick(event: MouseEvent) {
	if (event.target === event.currentTarget) {
		handleCancel();
	}
}
</script>

{#if show}
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[1000] animate-fadeIn sm:items-center" 
     on:click={handleBackdropClick}
     role="dialog"
     aria-modal="true"
     aria-labelledby="modal-title">
	<div class="bg-white rounded-t-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto animate-slideUp sm:rounded-lg sm:w-[90%] sm:animate-slideIn">
		<div class="p-4 border-b border-gray-200 sm:p-6">
			<h3 id="modal-title" class="text-lg font-semibold text-gray-900 sm:text-xl">{title}</h3>
		</div>
		<div class="p-4 sm:p-6">
			<p class="text-gray-700 text-sm sm:text-base">{message}</p>
		</div>
		<div class="px-4 py-3 border-t border-gray-200 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
			{#if type === "confirm"}
				<button class="btn btn-secondary w-full sm:w-auto" on:click={handleCancel}>
					{cancelText}
				</button>
				<button class="btn btn-primary w-full sm:w-auto" on:click={handleConfirm}>
					{confirmText}
				</button>
			{:else}
				<button class="btn btn-primary w-full sm:w-auto" on:click={handleConfirm}>
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

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

.animate-fadeIn {
	animation: fadeIn 0.2s ease-out;
}

.animate-slideIn {
	animation: slideIn 0.2s ease-out;
}

.animate-slideUp {
	animation: slideUp 0.3s ease-out;
}
</style>