<script lang="ts">
	import { onMount } from 'svelte';
	import { getStreamsContext } from '$lib/stores/streams.svelte';
	import { getContentContext } from '$lib/stores/content.svelte';
	import { getFeedbackContext } from '$lib/stores/feedback.svelte';
	import { ContentFeed } from '$lib/components/content';
	import { FeedbackModal } from '$lib/components/feedback';
	import { Select, Button } from '$lib/components/ui';
	import { api } from '$lib/api/client';
	import { FeedbackSentiment, type ContentItemId, type StreamId } from '$lib/types/core';
	import type { Source } from '$lib/types/streams';

	const streams = getStreamsContext();
	const content = getContentContext();
	const feedback = getFeedbackContext();

	let selectedStreamId = $state<StreamId | ''>('');
	let showFeedbackModal = $state(false);
	let feedbackItemId = $state<ContentItemId | null>(null);
	let feedbackSentiment = $state<FeedbackSentiment>(FeedbackSentiment.Like);

	// Build stream options for the selector
	const streamOptions = $derived(() => {
		const options: Array<{ value: string; label: string }> = [];

		// Add sources
		for (const source of streams.sources) {
			options.push({
				value: source.id,
				label: `[Source] ${source.name}`
			});
		}

		// Add transforms
		for (const transform of streams.transforms) {
			options.push({
				value: transform.id,
				label: `[Transform] ${transform.name}`
			});
		}

		// Add output if set
		if (streams.outputStreamId && streams.outputStream) {
			options.unshift({
				value: streams.outputStreamId,
				label: `[Output] ${streams.outputStream.name}`
			});
		}

		return options;
	});

	// Get content items for the selected stream
	const feedItems = $derived(() => {
		if (!selectedStreamId) return [];
		return content.getItemsWithFeedbackForStream(selectedStreamId as StreamId);
	});

	// Auto-select output stream or first available stream
	$effect(() => {
		if (!selectedStreamId) {
			if (streams.outputStreamId) {
				selectedStreamId = streams.outputStreamId;
			} else if (streams.sources.length > 0) {
				selectedStreamId = streams.sources[0].id;
			}
		}
	});

	async function loadContent() {
		if (!selectedStreamId) return;

		content.setLoading(true);
		content.setError(null);

		try {
			// For now, only load from sources directly
			// In a real implementation, the backend would execute the DAG
			const stream = streams.streams.get(selectedStreamId as StreamId);

			if (stream?.kind === 'source') {
				const items = await api.fetchSourceContent(stream as Source);
				content.clearStreamItems(selectedStreamId as StreamId);
				content.addItems(items);
			} else {
				// For transforms, we would need backend execution
				// For now, show a placeholder message
				content.setError('Transform execution requires a backend. Showing source content instead.');

				// Load all source content as a demo
				const allContent = await api.fetchAllSourceContent(streams.sources);
				for (const [sourceId, items] of allContent) {
					content.clearStreamItems(sourceId);
					content.addItems(items);
				}
			}
		} catch (err) {
			content.setError(err instanceof Error ? err.message : 'Failed to load content');
		} finally {
			content.setLoading(false);
		}
	}

	function handleLike(itemId: string) {
		feedback.quickFeedback(itemId as ContentItemId, FeedbackSentiment.Like);
		content.setFeedback(itemId as ContentItemId, feedback.getFeedbackForContent(itemId as ContentItemId)!);
	}

	function handleDislike(itemId: string) {
		feedback.quickFeedback(itemId as ContentItemId, FeedbackSentiment.Dislike);
		content.setFeedback(itemId as ContentItemId, feedback.getFeedbackForContent(itemId as ContentItemId)!);
	}

	function handleDetailedFeedback(itemId: string, sentiment: FeedbackSentiment) {
		feedbackItemId = itemId as ContentItemId;
		feedbackSentiment = sentiment;
		showFeedbackModal = true;
	}

	function handleFeedbackSubmit(reasons: unknown[], comment?: string) {
		if (feedbackItemId) {
			const fb = feedback.addFeedback(
				feedbackItemId,
				feedbackSentiment,
				reasons as [],
				comment
			);
			content.setFeedback(feedbackItemId, fb);
		}
		showFeedbackModal = false;
		feedbackItemId = null;
	}

	function handleFeedbackCancel() {
		showFeedbackModal = false;
		feedbackItemId = null;
	}

	onMount(() => {
		// Load content when component mounts if we have sources
		if (streams.sources.length > 0) {
			loadContent();
		}
	});

	// Reload content when selected stream changes
	$effect(() => {
		if (selectedStreamId) {
			loadContent();
		}
	});
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header Section -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
		<div class="flex items-center gap-4">
			<div class="relative">
				<div class="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[--cyan]/20 to-[--accent-primary]/20 border border-[--cyan]/20">
					<svg class="w-6 h-6 text-[--cyan]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
					</svg>
				</div>
				<!-- Animated pulse ring -->
				<div class="absolute inset-0 rounded-xl bg-[--cyan]/10 animate-ping opacity-75" style="animation-duration: 3s;"></div>
			</div>
			<div>
				<h1 class="text-2xl font-display font-semibold text-[--text-primary] tracking-tight">Your Feed</h1>
				<p class="text-[--text-muted] text-sm mt-0.5">Curated content from your personalized algorithm</p>
			</div>
		</div>

		<div class="flex items-center gap-3">
			{#if streamOptions().length > 0}
				<Select
					bind:value={selectedStreamId}
					options={streamOptions()}
					placeholder="Select a stream"
					class="w-64"
				/>
			{/if}
			<Button
				variant="secondary"
				onclick={loadContent}
				disabled={content.isLoading || !selectedStreamId}
			>
				<span class="flex items-center gap-2">
					{#if content.isLoading}
						<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Loading...
					{:else}
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						Refresh
					{/if}
				</span>
			</Button>
		</div>
	</div>

	{#if streams.sources.length === 0}
		<div class="relative overflow-hidden text-center py-20 bg-gradient-to-b from-[--bg-tertiary] to-[--bg-secondary] rounded-2xl border border-[--border-primary]">
			<!-- Background decoration -->
			<div class="absolute inset-0 opacity-30">
				<div class="absolute top-10 left-10 w-32 h-32 bg-[--cyan]/10 rounded-full blur-3xl"></div>
				<div class="absolute bottom-10 right-10 w-40 h-40 bg-[--accent-primary]/10 rounded-full blur-3xl"></div>
			</div>

			<div class="relative">
				<div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-[--cyan]/20 to-[--accent-primary]/20 border border-[--cyan]/20">
					<svg class="w-10 h-10 text-[--cyan]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
					</svg>
				</div>
				<h2 class="text-xl font-display font-semibold text-[--text-primary] mb-3">No Sources Yet</h2>
				<p class="text-[--text-secondary] text-sm mb-6 max-w-md mx-auto leading-relaxed">
					Add some content sources to start building your personalized feed. Connect RSS feeds, APIs, or other data streams.
				</p>
				<a href="/sources">
					<Button variant="primary">
						<span class="flex items-center gap-2">
							<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
							</svg>
							Add Sources
						</span>
					</Button>
				</a>
			</div>
		</div>
	{:else}
		<ContentFeed
			items={feedItems()}
			isLoading={content.isLoading}
			error={content.error}
			emptyMessage="No content in this stream. Try refreshing or selecting a different stream."
			onlike={handleLike}
			ondislike={handleDislike}
			ondetailedfeedback={handleDetailedFeedback}
		/>
	{/if}
</div>

<FeedbackModal
	bind:open={showFeedbackModal}
	sentiment={feedbackSentiment}
	onsubmit={handleFeedbackSubmit}
	oncancel={handleFeedbackCancel}
/>
