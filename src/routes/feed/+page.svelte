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
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-xl font-semibold text-zinc-100">Your Feed</h1>
			<p class="text-zinc-500 text-sm">Content from your personalized algorithm</p>
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
				{content.isLoading ? 'Loading...' : 'Refresh'}
			</Button>
		</div>
	</div>

	{#if streams.sources.length === 0}
		<div class="text-center py-16">
			<div class="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-4">
				<svg class="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
				</svg>
			</div>
			<h2 class="text-lg font-medium text-zinc-200 mb-2">No Sources Yet</h2>
			<p class="text-zinc-500 text-sm mb-5 max-w-md mx-auto">
				Add some sources to start seeing content in your feed.
			</p>
			<a href="/sources">
				<Button variant="primary">Add Sources</Button>
			</a>
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
