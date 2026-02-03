<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { createStreamsContext } from '$lib/stores/streams.svelte';
	import { createContentContext } from '$lib/stores/content.svelte';
	import { createFeedbackContext } from '$lib/stores/feedback.svelte';

	let { children } = $props();

	// Initialize stores in context
	createStreamsContext();
	createContentContext();
	createFeedbackContext();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>I'm Bored - Your Personalized Content Feed</title>
</svelte:head>

<div class="min-h-screen bg-[--bg-primary]">
	<nav class="bg-[--bg-secondary] border-b border-[--border-primary] sticky top-0 z-40">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-14">
				<div class="flex items-center">
					<a href="/" class="flex items-center gap-2.5">
						<div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: #7aa2f7;">
							<svg class="w-5 h-5" style="color: #1a1b26;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7" />
							</svg>
						</div>
						<span class="font-display font-semibold text-lg text-[--text-primary]">im bored</span>
					</a>
				</div>

				<div class="flex items-center gap-1">
					<a
						href="/"
						class="px-3 py-1.5 rounded-md text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-tertiary] transition-colors text-sm font-medium"
					>
						Dashboard
					</a>
					<a
						href="/feed"
						class="px-3 py-1.5 rounded-md text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-tertiary] transition-colors text-sm font-medium"
					>
						Feed
					</a>
					<a
						href="/algorithm"
						class="px-3 py-1.5 rounded-md text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-tertiary] transition-colors text-sm font-medium"
					>
						Algorithm
					</a>
					<a
						href="/sources"
						class="px-3 py-1.5 rounded-md text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-tertiary] transition-colors text-sm font-medium"
					>
						Sources
					</a>
				</div>
			</div>
		</div>
	</nav>

	<main>
		{@render children()}
	</main>
</div>
