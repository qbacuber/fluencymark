<script lang="ts">
	import { documentStore } from '$lib/stores/documentStore.svelte';
	import EditorView from '$lib/components/EditorView.svelte';
	import InteractiveView from '$lib/components/InteractiveView.svelte';
	import PrintView from '$lib/components/PrintView.svelte';
</script>

{#if documentStore.mode === 'edit'}
	<EditorView />
{:else}
	<InteractiveView />
{/if}

<PrintView />
