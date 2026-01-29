import { getContext, setContext } from 'svelte';
import type { ContentItemId, StreamId, ContentItem, ContentItemWithFeedback } from '$lib/types/core';
import type { Feedback } from '$lib/types/core';

const CONTENT_CONTEXT_KEY = Symbol('content');

export interface ContentState {
	items: Map<ContentItemId, ContentItem>;
	streamItems: Map<StreamId, ContentItemId[]>;
	isLoading: boolean;
	error: string | null;
}

function createContentStore() {
	let items = $state<Map<ContentItemId, ContentItem>>(new Map());
	let streamItems = $state<Map<StreamId, ContentItemId[]>>(new Map());
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let feedbackMap = $state<Map<ContentItemId, Feedback>>(new Map());

	// Derived: all items as array
	const allItems = $derived(Array.from(items.values()));

	// Get items for a specific stream
	function getItemsForStream(streamId: StreamId): ContentItem[] {
		const itemIds = streamItems.get(streamId) ?? [];
		return itemIds
			.map((id) => items.get(id))
			.filter((item): item is ContentItem => item !== undefined);
	}

	// Get items with feedback for a specific stream
	function getItemsWithFeedbackForStream(streamId: StreamId): ContentItemWithFeedback[] {
		return getItemsForStream(streamId).map((item) => ({
			...item,
			feedback: feedbackMap.get(item.id)
		}));
	}

	function addItem(item: ContentItem) {
		items.set(item.id, item);

		// Add to stream items
		const existing = streamItems.get(item.sourceStreamId) ?? [];
		if (!existing.includes(item.id)) {
			streamItems.set(item.sourceStreamId, [...existing, item.id]);
		}
	}

	function addItems(newItems: ContentItem[]) {
		for (const item of newItems) {
			addItem(item);
		}
	}

	function updateItem(id: ContentItemId, updates: Partial<ContentItem>) {
		const existing = items.get(id);
		if (existing) {
			items.set(id, { ...existing, ...updates });
		}
	}

	function removeItem(id: ContentItemId) {
		const item = items.get(id);
		if (item) {
			items.delete(id);
			const streamList = streamItems.get(item.sourceStreamId);
			if (streamList) {
				streamItems.set(
					item.sourceStreamId,
					streamList.filter((itemId) => itemId !== id)
				);
			}
			feedbackMap.delete(id);
		}
	}

	function setFeedback(itemId: ContentItemId, feedback: Feedback) {
		feedbackMap.set(itemId, feedback);
	}

	function removeFeedback(itemId: ContentItemId) {
		feedbackMap.delete(itemId);
	}

	function getFeedback(itemId: ContentItemId): Feedback | undefined {
		return feedbackMap.get(itemId);
	}

	function setLoading(loading: boolean) {
		isLoading = loading;
	}

	function setError(err: string | null) {
		error = err;
	}

	function clearStreamItems(streamId: StreamId) {
		const itemIds = streamItems.get(streamId) ?? [];
		for (const id of itemIds) {
			items.delete(id);
			feedbackMap.delete(id);
		}
		streamItems.delete(streamId);
	}

	function clear() {
		items = new Map();
		streamItems = new Map();
		feedbackMap = new Map();
		isLoading = false;
		error = null;
	}

	return {
		// State getters
		get items() {
			return items;
		},
		get allItems() {
			return allItems;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},

		// Item operations
		getItemsForStream,
		getItemsWithFeedbackForStream,
		addItem,
		addItems,
		updateItem,
		removeItem,

		// Feedback operations
		setFeedback,
		removeFeedback,
		getFeedback,

		// State operations
		setLoading,
		setError,
		clearStreamItems,
		clear
	};
}

export type ContentStore = ReturnType<typeof createContentStore>;

export function createContentContext() {
	const store = createContentStore();
	setContext(CONTENT_CONTEXT_KEY, store);
	return store;
}

export function getContentContext(): ContentStore {
	const store = getContext<ContentStore>(CONTENT_CONTEXT_KEY);
	if (!store) {
		throw new Error('ContentStore not found in context. Did you forget to call createContentContext?');
	}
	return store;
}
