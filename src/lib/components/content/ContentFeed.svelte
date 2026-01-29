<script lang="ts">
	import type { ContentItemWithFeedback, StreamId } from '$lib/types/core';
	import { FeedbackSentiment } from '$lib/types/core';
	import ContentCard from './ContentCard.svelte';

	interface Props {
		items: ContentItemWithFeedback[];
		isLoading?: boolean;
		error?: string | null;
		emptyMessage?: string;
		onlike?: (itemId: string) => void;
		ondislike?: (itemId: string) => void;
		ondetailedfeedback?: (itemId: string, sentiment: FeedbackSentiment) => void;
		onloadmore?: () => void;
		hasMore?: boolean;
	}

	let {
		items,
		isLoading = false,
		error = null,
		emptyMessage = 'No content yet. Add some sources to get started!',
		onlike,
		ondislike,
		ondetailedfeedback,
		onloadmore,
		hasMore = false
	}: Props = $props();

	function handleLike(itemId: string) {
		onlike?.(itemId);
	}

	function handleDislike(itemId: string) {
		ondislike?.(itemId);
	}

	function handleDetailedFeedback(itemId: string, sentiment: FeedbackSentiment) {
		ondetailedfeedback?.(itemId, sentiment);
	}
</script>

<div class="space-y-4">
	{#if error}
		<div class="bg-red-950/50 border border-red-900/50 rounded-lg p-4">
			<div class="flex items-center gap-2 text-red-400">
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span class="font-medium text-sm">Error loading content</span>
			</div>
			<p class="mt-1 text-sm text-red-300">{error}</p>
		</div>
	{/if}

	{#if items.length === 0 && !isLoading && !error}
		<div class="text-center py-12">
			<div class="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4">
				<svg class="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
				</svg>
			</div>
			<p class="text-zinc-500 text-sm">{emptyMessage}</p>
		</div>
	{/if}

	{#if items.length > 0}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each items as item (item.id)}
				<ContentCard
					{item}
					onlike={() => handleLike(item.id)}
					ondislike={() => handleDislike(item.id)}
					ondetailedfeedback={(sentiment) => handleDetailedFeedback(item.id, sentiment)}
				/>
			{/each}
		</div>
	{/if}

	{#if isLoading}
		<div class="flex justify-center py-8">
			<div class="flex items-center gap-2 text-zinc-500">
				<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				<span class="text-sm">Loading content...</span>
			</div>
		</div>
	{/if}

	{#if hasMore && !isLoading && items.length > 0}
		<div class="flex justify-center py-4">
			<button
				type="button"
				class="px-4 py-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
				onclick={onloadmore}
			>
				Load more
			</button>
		</div>
	{/if}
</div>
