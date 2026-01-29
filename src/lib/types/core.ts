import { nanoid } from 'nanoid';

// Branded types for type safety
export type ContentItemId = string & { readonly __brand: 'ContentItemId' };
export type StreamId = string & { readonly __brand: 'StreamId' };
export type FeedbackId = string & { readonly __brand: 'FeedbackId' };

export function createContentItemId(): ContentItemId {
	return nanoid() as ContentItemId;
}

export function createStreamId(): StreamId {
	return nanoid() as StreamId;
}

export function createFeedbackId(): FeedbackId {
	return nanoid() as FeedbackId;
}

// Content type enum
export enum ContentType {
	Article = 'article',
	Video = 'video',
	Task = 'task',
	Image = 'image',
	Audio = 'audio'
}

// Feedback sentiment
export enum FeedbackSentiment {
	Like = 'like',
	Dislike = 'dislike',
	Neutral = 'neutral'
}

// Feedback reason categories
export enum FeedbackReason {
	Interesting = 'interesting',
	Relevant = 'relevant',
	WellWritten = 'well_written',
	Boring = 'boring',
	Irrelevant = 'irrelevant',
	TooLong = 'too_long',
	TooShort = 'too_short',
	ClickBait = 'clickbait',
	Duplicate = 'duplicate',
	OutOfDate = 'out_of_date',
	Other = 'other'
}

// LLM enrichment data added by transforms
export interface LLMEnrichments {
	summary?: string;
	tags?: string[];
	relevanceScore?: number;
	sentiment?: string;
	[key: string]: unknown;
}

// Individual piece of content
export interface ContentItem {
	id: ContentItemId;
	sourceStreamId: StreamId;
	type: ContentType;
	title: string;
	description?: string;
	content?: string;
	url?: string;
	imageUrl?: string;
	author?: string;
	publishedAt?: Date;
	fetchedAt: Date;
	metadata?: Record<string, unknown>;
	llmEnrichments?: LLMEnrichments;
}

// User feedback on content
export interface Feedback {
	id: FeedbackId;
	contentItemId: ContentItemId;
	sentiment: FeedbackSentiment;
	reasons?: FeedbackReason[];
	comment?: string;
	createdAt: Date;
}

// Content item with its associated feedback
export interface ContentItemWithFeedback extends ContentItem {
	feedback?: Feedback;
}
