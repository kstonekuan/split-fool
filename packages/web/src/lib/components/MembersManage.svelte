<script lang="ts">
import type { Member } from "@split-fool/shared";
import { api } from "../api/client";
import { toast } from "../stores/toast";
import { getErrorMessage } from "../utils/error-handling";
import { getMemberInitials } from "../utils/formatters";
import {
	isDuplicateMemberName,
	validateMemberName,
} from "../utils/member-utils";
import Modal from "./Modal.svelte";

export let members: Member[];
export let groupCode: string;
export let onBack: () => void;
export let onRefresh: (() => void) | undefined = undefined;

let newMemberName = "";
let loading = false;
let error = "";
let showDeleteModal = false;
let memberToDelete: string | null = null;
let showErrorModal = false;
let errorMessage = "";

async function addMember() {
	const trimmedName = newMemberName.trim();

	// Validate member name
	const validation = validateMemberName(trimmedName);
	if (!validation.isValid) {
		error = validation.error || "";
		return;
	}

	// Check for duplicate names on client side
	if (isDuplicateMemberName(trimmedName, members)) {
		error = `A member named "${trimmedName}" already exists`;
		return;
	}

	loading = true;
	error = "";

	try {
		await api.createMember(groupCode, { name: trimmedName });
		newMemberName = "";
		toast.success(`Added ${trimmedName} to the group`);
		onRefresh?.();
	} catch (err) {
		error = getErrorMessage(err);
	} finally {
		loading = false;
	}
}

function confirmDelete(memberId: string) {
	memberToDelete = memberId;
	showDeleteModal = true;
}

async function deleteMember() {
	if (!memberToDelete) return;

	try {
		await api.deleteMember(groupCode, memberToDelete);
		toast.success("Member deleted successfully");
		onRefresh?.();
	} catch (err) {
		errorMessage = getErrorMessage(err);
		showErrorModal = true;
	} finally {
		memberToDelete = null;
		showDeleteModal = false;
	}
}
</script>

<div class="card">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-bold">Manage Members</h2>
    <button class="btn btn-secondary" on:click={onBack}>
      Back to View
    </button>
  </div>

  <form on:submit|preventDefault={addMember} class="mb-4">
    <div class="flex gap-2">
      <input
        type="text"
        class="input"
        bind:value={newMemberName}
        placeholder="Enter member name"
        disabled={loading}
      />
      <button type="submit" class="btn btn-primary" disabled={loading}>
        {loading ? "Adding..." : "Add Member"}
      </button>
    </div>
    {#if error}
      <p class="error">{error}</p>
    {/if}
  </form>

  <div class="h-px bg-gray-200 my-6"></div>

  {#if members.length === 0}
    <p class="text-gray-500">No members yet. Add the first member above!</p>
  {:else}
    <div class="flex flex-col gap-2">
      {#each members as member}
        <div class="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              {getMemberInitials(member.name)}
            </div>
            <span class="font-medium">{member.name}</span>
          </div>
          <button
            class="btn btn-danger btn-small"
            on:click={() => confirmDelete(member.id)}
          >
            Remove
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<Modal
	show={showDeleteModal}
	title="Remove Member"
	message="Are you sure you want to remove this member? This will also remove them from all expense splits."
	type="confirm"
	confirmText="Remove"
	cancelText="Cancel"
	onConfirm={deleteMember}
	onCancel={() => showDeleteModal = false}
/>

<Modal
	show={showErrorModal}
	title="Error"
	message={errorMessage}
	type="error"
	onConfirm={() => showErrorModal = false}
/>