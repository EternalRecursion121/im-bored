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

	const typeConfig = $derived(() => {
		switch (item.type) {
			case ContentType.Article:
				return { icon: 'article', label: 'Article', color: 'var(--accent-primary)', bg: 'rgba(122, 162, 247, 0.15)' };
			case ContentType.Video:
				return { icon: 'video', label: 'Video', color: 'var(--error)', bg: 'rgba(247, 118, 142, 0.15)' };
			case ContentType.Task:
				return { icon: 'task', label: 'Task', color: 'var(--success)', bg: 'rgba(158, 206, 106, 0.15)' };
			case ContentType.Image:
				return { icon: 'image', label: 'Image', color: 'var(--cyan)', bg: 'rgba(125, 207, 255, 0.15)' };
			case ContentType.Audio:
				return { icon: 'audio', label: 'Audio', color: 'var(--warning)', bg: 'rgba(224, 175, 104, 0.15)' };
			default:
				return { icon: 'article', label: 'Article', color: 'var(--accent-primary)', bg: 'rgba(122, 162, 247, 0.15)' };
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
	const hasImage = $derived(!!item.imageUrl);
</script>

<article
	class="group relative bg-[--bg-tertiary] rounded-xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
	class:card-with-image={hasImage}
	class:card-without-image={!hasImage}
>
	<!-- Gradient border effect -->
	<div class="absolute inset-0 rounded-xl bg-gradient-to-br from-[--accent-primary]/20 via-transparent to-[--accent-secondary]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
	<div class="absolute inset-[1px] rounded-xl bg-[--bg-tertiary] pointer-events-none"></div>

	<div class="relative">
		{#if item.imageUrl}
			<div class="relative aspect-[16/10] overflow-hidden">
				<img
					src={item.imageUrl}
					alt=""
					class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
					loading="lazy"
				/>
				<!-- Gradient overlay for better text contrast -->
				<div class="absolute inset-0 bg-gradient-to-t from-[--bg-tertiary] via-transparent to-transparent"></div>

				<!-- Floating type badge -->
				<div
					class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md flex items-center gap-1.5"
					style="background: {typeConfig().bg}; color: {typeConfig().color}; border: 1px solid {typeConfig().color}20;"
				>
					{#if typeConfig().icon === 'article'}
						<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					{:else if typeConfig().icon === 'video'}
						<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
							<path d="M8 5v14l11-7z"/>
						</svg>
					{:else if typeConfig().icon === 'task'}
						<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					{:else if typeConfig().icon === 'image'}
						<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					{:else}
						<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
						</svg>
					{/if}
					{typeConfig().label}
				</div>
			</div>
		{/if}

		<div class="p-4" class:pt-0={hasImage} class:-mt-6={hasImage} class:relative={hasImage} class:z-10={hasImage}>
			<!-- Card without image gets inline type badge -->
			{#if !hasImage}
				<div class="flex items-center gap-2 mb-3">
					<div
						class="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
						style="background: {typeConfig().bg}; color: {typeConfig().color};"
					>
						{#if typeConfig().icon === 'article'}
							<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						{:else if typeConfig().icon === 'video'}
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z"/>
							</svg>
						{:else if typeConfig().icon === 'task'}
							<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						{:else if typeConfig().icon === 'image'}
							<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						{:else}
							<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
							</svg>
						{/if}
						{typeConfig().label}
					</div>
					{#if item.llmEnrichments?.relevanceScore !== undefined}
						<div class="ml-auto flex items-center gap-1 text-xs text-[--warning]">
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
							</svg>
							<span class="font-semibold">{Math.round(item.llmEnrichments.relevanceScore * 100)}%</span>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Title -->
			<h3 class="font-display font-semibold text-[--text-primary] leading-snug mb-2" class:text-base={hasImage} class:text-sm={!hasImage}>
				{#if item.url}
					<a
						href={item.url}
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-[--accent-primary] transition-colors line-clamp-2"
					>
						{item.title}
					</a>
				{:else}
					<span class="line-clamp-2">{item.title}</span>
				{/if}
			</h3>

			{#if item.description}
				<p class="text-[--text-secondary] text-sm leading-relaxed line-clamp-2 mb-3">
					{item.description}
				</p>
			{/if}

			{#if item.llmEnrichments?.summary}
				<div class="relative bg-gradient-to-br from-[--accent-secondary]/8 to-[--accent-primary]/5 rounded-lg p-3 mb-3 border border-[--accent-secondary]/15">
					<div class="flex items-center gap-1.5 text-xs text-[--accent-secondary] font-medium mb-1.5">
						<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
						AI Summary
					</div>
					<p class="text-sm text-[--text-secondary] leading-relaxed">{item.llmEnrichments.summary}</p>
				</div>
			{/if}

			{#if item.llmEnrichments?.tags && item.llmEnrichments.tags.length > 0}
				<div class="flex flex-wrap gap-1.5 mb-3">
					{#each item.llmEnrichments.tags.slice(0, 4) as tag}
						<span class="px-2 py-0.5 bg-[--bg-elevated]/80 text-[--text-muted] text-xs rounded-md border border-[--border-primary]/50 hover:border-[--accent-primary]/30 hover:text-[--text-secondary] transition-colors cursor-default">
							#{tag}
						</span>
					{/each}
					{#if item.llmEnrichments.tags.length > 4}
						<span class="px-2 py-0.5 text-[--text-muted] text-xs">
							+{item.llmEnrichments.tags.length - 4}
						</span>
					{/if}
				</div>
			{/if}

			<!-- Footer -->
			<div class="flex items-center justify-between pt-3 border-t border-[--border-primary]/50">
				<div class="flex items-center gap-2 text-xs text-[--text-muted] min-w-0">
					{#if item.author}
						<span class="font-medium text-[--text-secondary] truncate max-w-[120px]">{item.author}</span>
						<span class="text-[--border-secondary]">·</span>
					{/if}
					<span class="whitespace-nowrap">{formattedDate()}</span>
					{#if hasImage && item.llmEnrichments?.relevanceScore !== undefined}
						<span class="text-[--border-secondary]">·</span>
						<span class="text-[--warning] font-semibold flex items-center gap-0.5">
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
							</svg>
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
	</div>
</article>

<style>
	.card-with-image {
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.1),
			0 8px 16px rgba(0, 0, 0, 0.1);
	}

	.card-without-image {
		border: 1px solid var(--border-primary);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.card-without-image:hover {
		border-color: var(--border-secondary);
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.1),
			0 8px 16px rgba(0, 0, 0, 0.05);
	}

	.group:hover .card-with-image {
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.15),
			0 16px 32px rgba(0, 0, 0, 0.15);
	}
</style>
