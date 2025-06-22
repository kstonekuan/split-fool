<script lang="ts">
import type { Member } from "@split-fool/shared";
import { createEventDispatcher } from "svelte";
import { api } from "../api/client";
import Modal from "./Modal.svelte";
import { toast } from "../stores/toast";

export let members: Member[];
export let groupCode: string;

const dispatch = createEventDispatcher();

let newMemberName = "";
let _loading = false;
let _error = "";
let showDeleteModal = false;
let memberToDelete: string | null = null;
let showErrorModal = false;
let errorMessage = "";

async function _addMember() {
	const trimmedName = newMemberName.trim();
	
	if (!trimmedName) {
		_error = "Member name is required";
		return;
	}

	// Check for duplicate names on client side
	const nameExists = members.some(
		member => member.name.toLowerCase() === trimmedName.toLowerCase()
	);
	
	if (nameExists) {
		_error = `A member named "${trimmedName}" already exists`;
		return;
	}

	_loading = true;
	_error = "";

	try {
		await api.createMember(groupCode, { name: trimmedName });
		newMemberName = "";
		toast.success(`Added ${trimmedName} to the group`);
		dispatch("refresh");
	} catch (err) {
		_error = err instanceof Error ? err.message : "Failed to add member";
	} finally {
		_loading = false;
	}
}

function confirmDelete(memberId: string) {
	memberToDelete = memberId;
	showDeleteModal = true;
}

async function _deleteMember() {
	if (!memberToDelete) return;

	try {
		await api.deleteMember(groupCode, memberToDelete);
		toast.success("Member deleted successfully");
		dispatch("refresh");
	} catch (err) {
		errorMessage = err instanceof Error ? err.message : "Failed to delete member";
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

  <form on:submit|preventDefault={_addMember} class="flex gap-2">
    <input
      type="text"
      class="input"
      bind:value={newMemberName}
      placeholder="Enter member name"
      disabled={_loading}
    />
    <button type="submit" class="btn btn-primary" disabled={_loading}>
      {_loading ? "Adding..." : "Add"}
    </button>
  </form>
  
  {#if _error}
    <p class="error">{_error}</p>
  {/if}
</div>

<Modal
	show={showDeleteModal}
	title="Delete Member"
	message="Are you sure you want to delete this member?"
	type="confirm"
	confirmText="Delete"
	cancelText="Cancel"
	on:confirm={_deleteMember}
	on:cancel={() => showDeleteModal = false}
/>

<Modal
	show={showErrorModal}
	title="Error"
	message={errorMessage}
	type="error"
	on:confirm={() => showErrorModal = false}
/>