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

<div class="space-y-6">
	{#if error}
		<div class="relative overflow-hidden bg-gradient-to-r from-[--error]/10 to-[--error]/5 border border-[--error]/20 rounded-xl p-4">
			<div class="absolute top-0 right-0 w-32 h-32 bg-[--error]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
			<div class="relative flex items-start gap-3">
				<div class="w-10 h-10 rounded-lg bg-[--error]/15 flex items-center justify-center flex-shrink-0">
					<svg class="w-5 h-5 text-[--error]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>
				<div>
					<h3 class="font-medium text-[--error] text-sm">Error loading content</h3>
					<p class="mt-1 text-sm text-[--text-secondary] leading-relaxed">{error}</p>
				</div>
			</div>
		</div>
	{/if}

	{#if items.length === 0 && !isLoading && !error}
		<div class="text-center py-16">
			<div class="relative inline-block mb-6">
				<div class="w-16 h-16 bg-gradient-to-br from-[--bg-elevated] to-[--bg-tertiary] rounded-2xl flex items-center justify-center border border-[--border-primary]">
					<svg class="w-8 h-8 text-[--text-muted]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
					</svg>
				</div>
				<div class="absolute -bottom-1 -right-1 w-6 h-6 bg-[--bg-tertiary] rounded-full flex items-center justify-center border border-[--border-primary]">
					<svg class="w-3.5 h-3.5 text-[--text-muted]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
				</div>
			</div>
			<p class="text-[--text-secondary] text-sm max-w-sm mx-auto leading-relaxed">{emptyMessage}</p>
		</div>
	{/if}

	{#if items.length > 0}
		<div class="feed-grid">
			{#each items as item, index (item.id)}
				<div
					class="feed-item"
					class:featured={index === 0 && item.imageUrl}
					style="--delay: {index * 50}ms"
				>
					<ContentCard
						{item}
						onlike={() => handleLike(item.id)}
						ondislike={() => handleDislike(item.id)}
						ondetailedfeedback={(sentiment) => handleDetailedFeedback(item.id, sentiment)}
					/>
				</div>
			{/each}
		</div>
	{/if}

	{#if isLoading}
		<div class="flex justify-center py-12">
			<div class="flex flex-col items-center gap-4">
				<div class="relative">
					<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[--accent-primary]/20 to-[--cyan]/20 flex items-center justify-center">
						<svg class="w-6 h-6 text-[--accent-primary] animate-spin" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="3"
							></circle>
							<path
								class="opacity-90"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					</div>
					<div class="absolute inset-0 rounded-xl bg-[--accent-primary]/10 animate-ping" style="animation-duration: 2s;"></div>
				</div>
				<span class="text-sm text-[--text-secondary] font-medium">Loading content...</span>
			</div>
		</div>
	{/if}

	{#if hasMore && !isLoading && items.length > 0}
		<div class="flex justify-center py-6">
			<button
				type="button"
				class="group px-6 py-2.5 text-sm text-[--accent-primary] hover:text-white font-medium transition-all duration-300 rounded-full border border-[--accent-primary]/30 hover:border-[--accent-primary] hover:bg-[--accent-primary] flex items-center gap-2"
				onclick={onloadmore}
			>
				<span>Load more</span>
				<svg class="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
				</svg>
			</button>
		</div>
	{/if}
</div>

<style>
	.feed-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1.25rem;
	}

	@media (min-width: 640px) {
		.feed-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.feed-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.feed-item.featured {
			grid-column: span 2;
		}
	}

	@media (min-width: 1280px) {
		.feed-grid {
			gap: 1.5rem;
		}
	}

	.feed-item {
		animation: fadeInUp 0.4s ease-out both;
		animation-delay: var(--delay, 0ms);
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
