import { writable } from "svelte/store";

export interface ToastMessage {
	id: string;
	message: string;
	type: "success" | "error" | "info";
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastMessage[]>([]);

	return {
		subscribe,
		show(
			message: string,
			type: "success" | "error" | "info" = "info",
			duration = 3000,
		) {
			const id = Math.random().toString(36).substr(2, 9);
			const toast: ToastMessage = { id, message, type, duration };

			update((toasts) => [...toasts, toast]);

			setTimeout(() => {
				update((toasts) => toasts.filter((t) => t.id !== id));
			}, duration);
		},
		success(message: string, duration = 3000) {
			this.show(message, "success", duration);
		},
		error(message: string, duration = 4000) {
			this.show(message, "error", duration);
		},
		info(message: string, duration = 3000) {
			this.show(message, "info", duration);
		},
	};
}

export const toast = createToastStore();
