<script lang="ts">
	import type { ContentItemWithFeedback } from '$lib/types/core';
	import { ContentType, FeedbackSentiment } from '$lib/types/core';
	import FeedbackButtons from '$lib/components/feedback/FeedbackButtons.svelte';

	interface Props {
		item: ContentItemWithFeedback;
		onlike?: () => void;
		ondislike?: () => void;
		ondetailedfeedback?: (sentiment: FeedbackSentiment) => void;
	}

	let { item, onlike, ondislike, ondetailedfeedback }: Props = $props();

	const typeIcon = $derived(() => {
		switch (item.type) {
			case ContentType.Article:
				return 'article';
			case ContentType.Video:
				return 'video';
			case ContentType.Task:
				return 'task';
			case ContentType.Image:
				return 'image';
			case ContentType.Audio:
				return 'audio';
			default:
				return 'article';
		}
	});

	const formattedDate = $derived(() => {
		if (!item.publishedAt) return '';
		const date = new Date(item.publishedAt);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffHours / 24);

		if (diffHours < 1) return 'Just now';
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString();
	});

	const currentSentiment = $derived(item.feedback?.sentiment ?? null);
</script>

<article class="bg-[--bg-tertiary] rounded-lg border border-[--border-primary] overflow-hidden hover:border-[--border-secondary] transition-colors">
	{#if item.imageUrl}
		<div class="aspect-video relative overflow-hidden bg-[--bg-elevated]">
			<img
				src={item.imageUrl}
				alt=""
				class="w-full h-full object-cover"
				loading="lazy"
			/>
		</div>
	{/if}

	<div class="p-4">
		<div class="flex items-start gap-3 mb-2">
			<div class="w-8 h-8 bg-[--bg-elevated] rounded-md flex items-center justify-center flex-shrink-0">
				{#if typeIcon() === 'article'}
					<svg class="w-4 h-4 text-[--accent-primary]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				{:else if typeIcon() === 'video'}
					<svg class="w-4 h-4 text-[--error]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
						<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else if typeIcon() === 'task'}
					<svg class="w-4 h-4 text-[--success]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else if typeIcon() === 'image'}
					<svg class="w-4 h-4 text-[--cyan]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				{:else}
					<svg class="w-4 h-4 text-[--warning]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
					</svg>
				{/if}
			</div>
			<div class="flex-1 min-w-0">
				<h3 class="font-display font-medium text-[--text-primary] text-sm line-clamp-2">
					{#if item.url}
						<a
							href={item.url}
							target="_blank"
							rel="noopener noreferrer"
							class="hover:text-[--accent-primary] transition-colors"
						>
							{item.title}
						</a>
					{:else}
						{item.title}
					{/if}
				</h3>
			</div>
		</div>

		{#if item.description}
			<p class="text-[--text-muted] text-sm line-clamp-3 mb-3">
				{item.description}
			</p>
		{/if}

		{#if item.llmEnrichments?.summary}
			<div class="bg-[--accent-secondary]/10 rounded-md p-3 mb-3 border border-[--accent-secondary]/20">
				<div class="text-xs text-[--accent-secondary] font-medium mb-1">AI Summary</div>
				<p class="text-sm text-[--text-secondary]">{item.llmEnrichments.summary}</p>
			</div>
		{/if}

		{#if item.llmEnrichments?.tags && item.llmEnrichments.tags.length > 0}
			<div class="flex flex-wrap gap-1 mb-3">
				{#each item.llmEnrichments.tags as tag}
					<span class="px-2 py-0.5 bg-[--bg-elevated] text-[--text-secondary] text-xs rounded">
						{tag}
					</span>
				{/each}
			</div>
		{/if}

		<div class="flex items-center justify-between pt-3 border-t border-[--border-primary]">
			<div class="flex items-center gap-2 text-xs text-[--text-muted]">
				{#if item.author}
					<span class="font-medium text-[--text-secondary]">{item.author}</span>
					<span>·</span>
				{/if}
				<span>{formattedDate()}</span>
				{#if item.llmEnrichments?.relevanceScore !== undefined}
					<span>·</span>
					<span class="text-[--warning] font-medium">
						{Math.round(item.llmEnrichments.relevanceScore * 100)}%
					</span>
				{/if}
			</div>

			<FeedbackButtons
				sentiment={currentSentiment}
				{onlike}
				{ondislike}
				{ondetailedfeedback}
			/>
		</div>
	</div>
</article>
