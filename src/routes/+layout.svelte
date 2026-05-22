<script lang="ts">
	import './global.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<title>FluencyMark</title>
	<link rel="icon" href={favicon} />
</svelte:head>
{@render children()}
