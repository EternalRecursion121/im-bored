<script lang="ts">
	import { Modal, Button } from '$lib/components/ui';
	import { FeedbackSentiment, FeedbackReason } from '$lib/types/core';

	interface Props {
		open: boolean;
		sentiment: FeedbackSentiment;
		onsubmit?: (reasons: FeedbackReason[], comment?: string) => void;
		oncancel?: () => void;
	}

	let { open = $bindable(), sentiment, onsubmit, oncancel }: Props = $props();

	let selectedReasons = $state<FeedbackReason[]>([]);
	let comment = $state('');

	const positiveReasons = [
		{ value: FeedbackReason.Interesting, label: 'Interesting' },
		{ value: FeedbackReason.Relevant, label: 'Relevant to my interests' },
		{ value: FeedbackReason.WellWritten, label: 'Well written' }
	];

	const negativeReasons = [
		{ value: FeedbackReason.Boring, label: 'Not interesting' },
		{ value: FeedbackReason.Irrelevant, label: 'Not relevant' },
		{ value: FeedbackReason.TooLong, label: 'Too long' },
		{ value: FeedbackReason.TooShort, label: 'Too short' },
		{ value: FeedbackReason.ClickBait, label: 'Clickbait' },
		{ value: FeedbackReason.Duplicate, label: 'Seen this before' },
		{ value: FeedbackReason.OutOfDate, label: 'Outdated' }
	];

	const reasons = $derived(
		sentiment === FeedbackSentiment.Like ? positiveReasons : negativeReasons
	);

	const title = $derived(
		sentiment === FeedbackSentiment.Like ? 'What did you like?' : 'What was wrong?'
	);

	function toggleReason(reason: FeedbackReason) {
		if (selectedReasons.includes(reason)) {
			selectedReasons = selectedReasons.filter((r) => r !== reason);
		} else {
			selectedReasons = [...selectedReasons, reason];
		}
	}

	function handleSubmit() {
		onsubmit?.(selectedReasons, comment || undefined);
		reset();
	}

	function handleCancel() {
		oncancel?.();
		reset();
	}

	function reset() {
		selectedReasons = [];
		comment = '';
		open = false;
	}
</script>

<Modal bind:open {title} size="md" onclose={handleCancel}>
	<div class="space-y-4">
		<p class="text-sm text-[--text-muted]">
			Help us understand your preference (select all that apply):
		</p>

		<div class="grid grid-cols-2 gap-2">
			{#each reasons as reason}
				<button
					type="button"
					class="p-3 text-left border rounded-md transition-all
						{selectedReasons.includes(reason.value)
							? sentiment === FeedbackSentiment.Like
								? 'border-[--success] bg-[--success]/20 text-[--success]'
								: 'border-[--error] bg-[--error]/20 text-[--error]'
							: 'border-[--border-primary] hover:border-[--border-secondary] hover:bg-[--bg-elevated] text-[--text-secondary]'}"
					onclick={() => toggleReason(reason.value)}
				>
					<span class="text-sm font-medium">{reason.label}</span>
				</button>
			{/each}
		</div>

		<div>
			<label for="feedback-comment" class="block text-sm font-medium text-[--text-secondary] mb-1.5">
				Additional comments (optional)
			</label>
			<textarea
				id="feedback-comment"
				bind:value={comment}
				rows="3"
				class="w-full px-3 py-2 border border-[--border-primary] rounded-md bg-[--bg-secondary] text-[--text-primary] placeholder-[--text-muted]
					focus:outline-none focus:ring-2 focus:ring-[--accent-primary] focus:border-[--accent-primary]"
				placeholder="Tell us more..."
			></textarea>
		</div>
	</div>

	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button variant="ghost" onclick={handleCancel}>Cancel</Button>
			<Button
				variant={sentiment === FeedbackSentiment.Like ? 'primary' : 'danger'}
				onclick={handleSubmit}
			>
				Submit Feedback
			</Button>
		</div>
	{/snippet}
</Modal>
