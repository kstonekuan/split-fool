<script lang="ts">
import type { Balance, Member, Settlement } from "@split-fool/shared";
import Balances from "./Balances.svelte";

export let balances: Balance[];
export let settlements: Settlement[];
export let members: Member[];
</script>

<Balances
  balances={balances}
  settlements={settlements}
/>