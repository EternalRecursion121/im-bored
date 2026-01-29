import { getContext, setContext } from 'svelte';
import type { FeedbackId, ContentItemId, Feedback, FeedbackSentiment, FeedbackReason } from '$lib/types/core';
import { createFeedbackId } from '$lib/types/core';

const FEEDBACK_CONTEXT_KEY = Symbol('feedback');

function createFeedbackStore() {
	let feedbackItems = $state<Map<FeedbackId, Feedback>>(new Map());
	let feedbackByContent = $state<Map<ContentItemId, FeedbackId>>(new Map());
	let pendingFeedback = $state<{
		contentItemId: ContentItemId;
		sentiment: FeedbackSentiment;
	} | null>(null);

	// Derived: all feedback as array
	const allFeedback = $derived(Array.from(feedbackItems.values()));

	// Derived: feedback counts by sentiment
	const feedbackCounts = $derived({
		like: allFeedback.filter((f) => f.sentiment === 'like').length,
		dislike: allFeedback.filter((f) => f.sentiment === 'dislike').length,
		neutral: allFeedback.filter((f) => f.sentiment === 'neutral').length
	});

	function getFeedbackForContent(contentItemId: ContentItemId): Feedback | undefined {
		const feedbackId = feedbackByContent.get(contentItemId);
		return feedbackId ? feedbackItems.get(feedbackId) : undefined;
	}

	function addFeedback(
		contentItemId: ContentItemId,
		sentiment: FeedbackSentiment,
		reasons?: FeedbackReason[],
		comment?: string
	): Feedback {
		// Remove existing feedback for this content item if any
		const existingId = feedbackByContent.get(contentItemId);
		if (existingId) {
			feedbackItems.delete(existingId);
		}

		const feedback: Feedback = {
			id: createFeedbackId(),
			contentItemId,
			sentiment,
			reasons,
			comment,
			createdAt: new Date()
		};

		feedbackItems.set(feedback.id, feedback);
		feedbackByContent.set(contentItemId, feedback.id);

		return feedback;
	}

	function updateFeedback(
		feedbackId: FeedbackId,
		updates: Partial<Omit<Feedback, 'id' | 'contentItemId' | 'createdAt'>>
	) {
		const existing = feedbackItems.get(feedbackId);
		if (existing) {
			feedbackItems.set(feedbackId, { ...existing, ...updates });
		}
	}

	function removeFeedback(feedbackId: FeedbackId) {
		const feedback = feedbackItems.get(feedbackId);
		if (feedback) {
			feedbackByContent.delete(feedback.contentItemId);
			feedbackItems.delete(feedbackId);
		}
	}

	function removeFeedbackForContent(contentItemId: ContentItemId) {
		const feedbackId = feedbackByContent.get(contentItemId);
		if (feedbackId) {
			feedbackItems.delete(feedbackId);
			feedbackByContent.delete(contentItemId);
		}
	}

	// Quick feedback (just sentiment, no reasons)
	function quickFeedback(contentItemId: ContentItemId, sentiment: FeedbackSentiment): Feedback {
		return addFeedback(contentItemId, sentiment);
	}

	// Start detailed feedback flow (opens modal)
	function startDetailedFeedback(contentItemId: ContentItemId, sentiment: FeedbackSentiment) {
		pendingFeedback = { contentItemId, sentiment };
	}

	// Complete detailed feedback flow
	function completeDetailedFeedback(reasons: FeedbackReason[], comment?: string): Feedback | null {
		if (!pendingFeedback) return null;

		const feedback = addFeedback(
			pendingFeedback.contentItemId,
			pendingFeedback.sentiment,
			reasons,
			comment
		);
		pendingFeedback = null;
		return feedback;
	}

	// Cancel detailed feedback flow
	function cancelDetailedFeedback() {
		pendingFeedback = null;
	}

	function clear() {
		feedbackItems = new Map();
		feedbackByContent = new Map();
		pendingFeedback = null;
	}

	return {
		// State getters
		get feedbackItems() {
			return feedbackItems;
		},
		get allFeedback() {
			return allFeedback;
		},
		get feedbackCounts() {
			return feedbackCounts;
		},
		get pendingFeedback() {
			return pendingFeedback;
		},

		// Operations
		getFeedbackForContent,
		addFeedback,
		updateFeedback,
		removeFeedback,
		removeFeedbackForContent,
		quickFeedback,
		startDetailedFeedback,
		completeDetailedFeedback,
		cancelDetailedFeedback,
		clear
	};
}

export type FeedbackStore = ReturnType<typeof createFeedbackStore>;

export function createFeedbackContext() {
	const store = createFeedbackStore();
	setContext(FEEDBACK_CONTEXT_KEY, store);
	return store;
}

export function getFeedbackContext(): FeedbackStore {
	const store = getContext<FeedbackStore>(FEEDBACK_CONTEXT_KEY);
	if (!store) {
		throw new Error('FeedbackStore not found in context. Did you forget to call createFeedbackContext?');
	}
	return store;
}
