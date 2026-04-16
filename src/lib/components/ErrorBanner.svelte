<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';

	let { message, onretry }: { message: string; onretry?: (() => void) | undefined } = $props();
	let dismissed = $state(false);

	// Reset dismissed state when a new error arrives
	$effect(() => {
		message;
		dismissed = false;
	});
</script>

{#if !dismissed}
	<Alert.Root variant="destructive">
		<Alert.Title>Error</Alert.Title>
		<Alert.Description>{message}</Alert.Description>
		<div class="flex items-center gap-2">
			{#if onretry}
				<Button variant="destructive" size="sm" onclick={onretry}>Retry</Button>
			{/if}
			<Button variant="ghost" size="icon-sm" onclick={() => (dismissed = true)} aria-label="Dismiss">
				<svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
					<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
				</svg>
			</Button>
		</div>
	</Alert.Root>
{/if}
