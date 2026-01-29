import type { StreamId } from './core';
import type { Stream, Source, Transform, SourceType, TransformType } from './streams';

// Node types for the DAG visualization
export type DAGNodeType = 'source' | 'transform' | 'output';

// Position in the DAG canvas
export interface Position {
	x: number;
	y: number;
}

// DAG node data
export interface DAGNodeData {
	stream: Stream;
	label: string;
	isSelected?: boolean;
	isProcessing?: boolean;
	hasError?: boolean;
	itemCount?: number;
}

// DAG node structure (compatible with Svelte Flow)
export interface DAGNode {
	id: string;
	type: DAGNodeType;
	position: Position;
	data: DAGNodeData;
	dragHandle?: string;
	selectable?: boolean;
	deletable?: boolean;
}

// DAG edge structure (compatible with Svelte Flow)
export interface DAGEdge {
	id: string;
	source: string;
	target: string;
	sourceHandle?: string;
	targetHandle?: string;
	animated?: boolean;
	style?: string;
}

// Complete DAG structure
export interface DAG {
	nodes: DAGNode[];
	edges: DAGEdge[];
	outputStreamId?: StreamId;
}

// DAG validation result
export interface DAGValidationResult {
	isValid: boolean;
	errors: DAGValidationError[];
	warnings: DAGValidationWarning[];
}

export interface DAGValidationError {
	type: 'cycle' | 'disconnected' | 'missing_input' | 'invalid_config';
	message: string;
	nodeIds?: string[];
}

export interface DAGValidationWarning {
	type: 'unused_stream' | 'single_input_mixer' | 'redundant_transform';
	message: string;
	nodeIds?: string[];
}

// Node creation helpers
export function createSourceNode(
	source: Source,
	position: Position
): DAGNode {
	return {
		id: source.id,
		type: 'source',
		position,
		data: {
			stream: source,
			label: source.name
		},
		selectable: true,
		deletable: true
	};
}

export function createTransformNode(
	transform: Transform,
	position: Position
): DAGNode {
	return {
		id: transform.id,
		type: 'transform',
		position,
		data: {
			stream: transform,
			label: transform.name
		},
		selectable: true,
		deletable: true
	};
}

export function createEdge(
	sourceId: string,
	targetId: string,
	animated = false
): DAGEdge {
	return {
		id: `${sourceId}-${targetId}`,
		source: sourceId,
		target: targetId,
		animated
	};
}

// Get node type icon based on source/transform type
export function getNodeIcon(stream: Stream): string {
	if (stream.kind === 'source') {
		switch (stream.config.type) {
			case 'rss' as SourceType:
				return 'rss';
			case 'youtube' as SourceType:
				return 'youtube';
			case 'todoist' as SourceType:
				return 'todoist';
			default:
				return 'source';
		}
	} else {
		switch (stream.config.type) {
			case 'mixer' as TransformType:
				return 'mixer';
			case 'filter' as TransformType:
				return 'filter';
			case 'sorter' as TransformType:
				return 'sorter';
			case 'limiter' as TransformType:
				return 'limiter';
			case 'llm_summarizer' as TransformType:
				return 'summarizer';
			case 'llm_tagger' as TransformType:
				return 'tagger';
			case 'llm_relevance_scorer' as TransformType:
				return 'scorer';
			case 'llm_semantic_filter' as TransformType:
				return 'semantic';
			default:
				return 'transform';
		}
	}
}

// Get human-readable type name
export function getTypeName(stream: Stream): string {
	if (stream.kind === 'source') {
		switch (stream.config.type) {
			case 'rss' as SourceType:
				return 'RSS Feed';
			case 'youtube' as SourceType:
				return 'YouTube';
			case 'todoist' as SourceType:
				return 'Todoist';
			default:
				return 'Source';
		}
	} else {
		switch (stream.config.type) {
			case 'mixer' as TransformType:
				return 'Mixer';
			case 'filter' as TransformType:
				return 'Filter';
			case 'sorter' as TransformType:
				return 'Sorter';
			case 'limiter' as TransformType:
				return 'Limiter';
			case 'llm_summarizer' as TransformType:
				return 'AI Summarizer';
			case 'llm_tagger' as TransformType:
				return 'AI Tagger';
			case 'llm_relevance_scorer' as TransformType:
				return 'AI Relevance Scorer';
			case 'llm_semantic_filter' as TransformType:
				return 'AI Semantic Filter';
			default:
				return 'Transform';
		}
	}
}
