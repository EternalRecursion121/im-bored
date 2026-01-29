import type { StreamId, ContentItem } from './core';

// Stream status
export enum StreamStatus {
	Active = 'active',
	Paused = 'paused',
	Error = 'error',
	Fetching = 'fetching'
}

// Base stream interface - anything that produces content
export interface BaseStream {
	id: StreamId;
	name: string;
	description?: string;
	status: StreamStatus;
	lastFetchedAt?: Date;
	errorMessage?: string;
}

// Source types
export enum SourceType {
	RSS = 'rss',
	YouTube = 'youtube',
	Todoist = 'todoist'
}

// RSS source configuration
export interface RSSSourceConfig {
	type: SourceType.RSS;
	feedUrl: string;
	maxItems?: number;
	refreshIntervalMinutes?: number;
}

// YouTube source configuration (future)
export interface YouTubeSourceConfig {
	type: SourceType.YouTube;
	channelId?: string;
	playlistId?: string;
	searchQuery?: string;
	maxResults?: number;
}

// Todoist source configuration (future)
export interface TodoistSourceConfig {
	type: SourceType.Todoist;
	projectId?: string;
	filterId?: string;
	labelId?: string;
}

export type SourceConfig = RSSSourceConfig | YouTubeSourceConfig | TodoistSourceConfig;

// Source - a stream that fetches content from external services
export interface Source extends BaseStream {
	kind: 'source';
	config: SourceConfig;
}

// Transform types
export enum TransformType {
	// Local transforms (fast, run in backend)
	Mixer = 'mixer',
	Filter = 'filter',
	Sorter = 'sorter',
	Limiter = 'limiter',
	// LLM transforms (async, run on backend with model calls)
	LLMSummarizer = 'llm_summarizer',
	LLMTagger = 'llm_tagger',
	LLMRelevanceScorer = 'llm_relevance_scorer',
	LLMSemanticFilter = 'llm_semantic_filter'
}

// Mixer configuration - combines multiple streams
export interface MixerConfig {
	type: TransformType.Mixer;
	inputStreamIds: StreamId[];
	weights?: Record<StreamId, number>; // Optional weights for each input
	strategy: 'interleave' | 'weighted' | 'round_robin';
}

// Filter configuration - removes items based on rules
export interface FilterConfig {
	type: TransformType.Filter;
	inputStreamId: StreamId;
	rules: FilterRule[];
	mode: 'include' | 'exclude';
}

export interface FilterRule {
	field: 'title' | 'description' | 'author' | 'content' | 'tag';
	operator: 'contains' | 'not_contains' | 'equals' | 'matches_regex';
	value: string;
}

// Sorter configuration - reorders items
export interface SorterConfig {
	type: TransformType.Sorter;
	inputStreamId: StreamId;
	sortBy: 'publishedAt' | 'fetchedAt' | 'title' | 'relevanceScore';
	order: 'asc' | 'desc';
}

// Limiter configuration - caps number of items
export interface LimiterConfig {
	type: TransformType.Limiter;
	inputStreamId: StreamId;
	maxItems: number;
}

// LLM Summarizer configuration
export interface LLMSummarizerConfig {
	type: TransformType.LLMSummarizer;
	inputStreamId: StreamId;
	model?: string;
	maxLength?: number;
	style?: 'brief' | 'detailed' | 'bullet_points';
}

// LLM Tagger configuration
export interface LLMTaggerConfig {
	type: TransformType.LLMTagger;
	inputStreamId: StreamId;
	model?: string;
	categories?: string[];
	maxTags?: number;
}

// LLM Relevance Scorer configuration
export interface LLMRelevanceScorerConfig {
	type: TransformType.LLMRelevanceScorer;
	inputStreamId: StreamId;
	model?: string;
	interests: string[];
	threshold?: number;
}

// LLM Semantic Filter configuration
export interface LLMSemanticFilterConfig {
	type: TransformType.LLMSemanticFilter;
	inputStreamId: StreamId;
	model?: string;
	criteria: string;
	mode: 'include' | 'exclude';
}

export type TransformConfig =
	| MixerConfig
	| FilterConfig
	| SorterConfig
	| LimiterConfig
	| LLMSummarizerConfig
	| LLMTaggerConfig
	| LLMRelevanceScorerConfig
	| LLMSemanticFilterConfig;

// Transform - operation applied to stream(s) to produce a new stream
export interface Transform extends BaseStream {
	kind: 'transform';
	config: TransformConfig;
}

// Union type for all streams
export type Stream = Source | Transform;

// Helper to check if a stream is a source
export function isSource(stream: Stream): stream is Source {
	return stream.kind === 'source';
}

// Helper to check if a stream is a transform
export function isTransform(stream: Stream): stream is Transform {
	return stream.kind === 'transform';
}

// Helper to get input stream IDs from a transform config
export function getInputStreamIds(config: TransformConfig): StreamId[] {
	switch (config.type) {
		case TransformType.Mixer:
			return config.inputStreamIds;
		case TransformType.Filter:
		case TransformType.Sorter:
		case TransformType.Limiter:
		case TransformType.LLMSummarizer:
		case TransformType.LLMTagger:
		case TransformType.LLMRelevanceScorer:
		case TransformType.LLMSemanticFilter:
			return [config.inputStreamId];
		default:
			return [];
	}
}

// Check if a transform is an LLM transform (async)
export function isLLMTransform(type: TransformType): boolean {
	return [
		TransformType.LLMSummarizer,
		TransformType.LLMTagger,
		TransformType.LLMRelevanceScorer,
		TransformType.LLMSemanticFilter
	].includes(type);
}
