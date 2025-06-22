import type { GroupDetailsResponse } from "@split-fool/shared";
import { writable } from "svelte/store";

export const currentGroup = writable<GroupDetailsResponse | null>(null);
export const loading = writable(false);
export const error = writable<string | null>(null);
