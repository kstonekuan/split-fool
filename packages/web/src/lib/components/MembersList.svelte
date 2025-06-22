<script lang="ts">
import type { Member } from "@split-fool/shared";
import { api } from "../api/client";
import { toast } from "../stores/toast";
import Modal from "./Modal.svelte";

export let members: Member[];
export let groupCode: string;
export let onRefresh: (() => void) | undefined = undefined;

let newMemberName = "";
let loading = false;
let error = "";
let showDeleteModal = false;
let memberToDelete: string | null = null;
let showErrorModal = false;
let errorMessage = "";

async function handleAddMember() {
	const trimmedName = newMemberName.trim();

	if (!trimmedName) {
		error = "Member name is required";
		return;
	}

	// Check for duplicate names on client side
	const nameExists = members.some(
		(member) => member.name.toLowerCase() === trimmedName.toLowerCase(),
	);

	if (nameExists) {
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
		error = err instanceof Error ? err.message : "Failed to add member";
	} finally {
		loading = false;
	}
}

function confirmDelete(memberId: string) {
	memberToDelete = memberId;
	showDeleteModal = true;
}

async function handleDeleteMember() {
	if (!memberToDelete) return;

	try {
		await api.deleteMember(groupCode, memberToDelete);
		toast.success("Member deleted successfully");
		onRefresh?.();
	} catch (err) {
		errorMessage =
			err instanceof Error ? err.message : "Failed to delete member";
		showErrorModal = true;
	} finally {
		memberToDelete = null;
		showDeleteModal = false;
	}
}
</script>

<div class="card">
  <h2 class="text-xl font-bold mb-4">Members</h2>

  {#if members.length === 0}
    <p class="text-secondary">No members yet. Add the first member!</p>
  {:else}
    <ul class="mb-4">
      {#each members as member}
        <li class="flex justify-between items-center py-2 border-b">
          <span>{member.name}</span>
          <button
            class="btn btn-danger"
            style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"
            on:click={() => confirmDelete(member.id)}
          >
            Delete
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <form on:submit|preventDefault={handleAddMember} class="flex gap-2">
    <input
      type="text"
      class="input"
      bind:value={newMemberName}
      placeholder="Enter member name"
      disabled={loading}
    />
    <button type="submit" class="btn btn-primary" disabled={loading}>
      {loading ? "Adding..." : "Add"}
    </button>
  </form>
  
  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>

<Modal
	show={showDeleteModal}
	title="Delete Member"
	message="Are you sure you want to delete this member?"
	type="confirm"
	confirmText="Delete"
	cancelText="Cancel"
	onConfirm={handleDeleteMember}
	onCancel={() => showDeleteModal = false}
/>

<Modal
	show={showErrorModal}
	title="Error"
	message={errorMessage}
	type="error"
	onConfirm={() => showErrorModal = false}
/>