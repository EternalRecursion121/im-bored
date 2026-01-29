<script lang="ts">
	import { FeedbackSentiment } from '$lib/types/core';

	interface Props {
		sentiment: FeedbackSentiment | null;
		onlike?: () => void;
		ondislike?: () => void;
		ondetailedfeedback?: (sentiment: FeedbackSentiment) => void;
		size?: 'sm' | 'md';
	}

	let {
		sentiment,
		onlike,
		ondislike,
		ondetailedfeedback,
		size = 'sm'
	}: Props = $props();

	const sizeClasses = {
		sm: 'w-8 h-8 text-lg',
		md: 'w-10 h-10 text-xl'
	};

	function handleLikeClick(e: MouseEvent) {
		if (e.shiftKey && ondetailedfeedback) {
			ondetailedfeedback(FeedbackSentiment.Like);
		} else {
			onlike?.();
		}
	}

	function handleDislikeClick(e: MouseEvent) {
		if (e.shiftKey && ondetailedfeedback) {
			ondetailedfeedback(FeedbackSentiment.Dislike);
		} else {
			ondislike?.();
		}
	}
</script>

<div class="flex items-center gap-1" title="Shift+click for detailed feedback">
	<button
		type="button"
		class="{sizeClasses[size]} rounded-md flex items-center justify-center transition-all
			{sentiment === FeedbackSentiment.Like
				? 'bg-emerald-900/50 text-emerald-400 scale-105'
				: 'hover:bg-zinc-800 text-zinc-500 hover:text-emerald-400'}"
		onclick={handleLikeClick}
		aria-label="Like"
		aria-pressed={sentiment === FeedbackSentiment.Like}
	>
		<svg
			class="w-4 h-4"
			fill={sentiment === FeedbackSentiment.Like ? 'currentColor' : 'none'}
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
			/>
		</svg>
	</button>

	<button
		type="button"
		class="{sizeClasses[size]} rounded-md flex items-center justify-center transition-all
			{sentiment === FeedbackSentiment.Dislike
				? 'bg-red-900/50 text-red-400 scale-105'
				: 'hover:bg-zinc-800 text-zinc-500 hover:text-red-400'}"
		onclick={handleDislikeClick}
		aria-label="Dislike"
		aria-pressed={sentiment === FeedbackSentiment.Dislike}
	>
		<svg
			class="w-4 h-4"
			fill={sentiment === FeedbackSentiment.Dislike ? 'currentColor' : 'none'}
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
			/>
		</svg>
	</button>
</div>
