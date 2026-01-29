import type { StreamId } from '$lib/types/core';
import type { Stream, Source, Transform, SourceConfig, TransformConfig } from '$lib/types/streams';
import { StreamStatus, SourceType, TransformType, getInputStreamIds } from '$lib/types/streams';
import type { DAG, DAGValidationResult, DAGValidationError, DAGValidationWarning } from '$lib/types/dag';
import { createStreamId } from '$lib/types/core';

// Create a new RSS source
export function createRSSSource(
	name: string,
	feedUrl: string,
	options?: {
		description?: string;
		maxItems?: number;
		refreshIntervalMinutes?: number;
	}
): Source {
	return {
		id: createStreamId(),
		kind: 'source',
		name,
		description: options?.description,
		status: StreamStatus.Active,
		config: {
			type: SourceType.RSS,
			feedUrl,
			maxItems: options?.maxItems ?? 50,
			refreshIntervalMinutes: options?.refreshIntervalMinutes ?? 30
		}
	};
}

// Create a new mixer transform
export function createMixer(
	name: string,
	inputStreamIds: StreamId[],
	options?: {
		description?: string;
		weights?: Record<StreamId, number>;
		strategy?: 'interleave' | 'weighted' | 'round_robin';
	}
): Transform {
	return {
		id: createStreamId(),
		kind: 'transform',
		name,
		description: options?.description,
		status: StreamStatus.Active,
		config: {
			type: TransformType.Mixer,
			inputStreamIds,
			weights: options?.weights,
			strategy: options?.strategy ?? 'interleave'
		}
	};
}

// Create a new filter transform
export function createFilter(
	name: string,
	inputStreamId: StreamId,
	rules: Array<{
		field: 'title' | 'description' | 'author' | 'content' | 'tag';
		operator: 'contains' | 'not_contains' | 'equals' | 'matches_regex';
		value: string;
	}>,
	options?: {
		description?: string;
		mode?: 'include' | 'exclude';
	}
): Transform {
	return {
		id: createStreamId(),
		kind: 'transform',
		name,
		description: options?.description,
		status: StreamStatus.Active,
		config: {
			type: TransformType.Filter,
			inputStreamId,
			rules,
			mode: options?.mode ?? 'exclude'
		}
	};
}

// Create a new sorter transform
export function createSorter(
	name: string,
	inputStreamId: StreamId,
	sortBy: 'publishedAt' | 'fetchedAt' | 'title' | 'relevanceScore',
	options?: {
		description?: string;
		order?: 'asc' | 'desc';
	}
): Transform {
	return {
		id: createStreamId(),
		kind: 'transform',
		name,
		description: options?.description,
		status: StreamStatus.Active,
		config: {
			type: TransformType.Sorter,
			inputStreamId,
			sortBy,
			order: options?.order ?? 'desc'
		}
	};
}

// Create a new limiter transform
export function createLimiter(
	name: string,
	inputStreamId: StreamId,
	maxItems: number,
	options?: {
		description?: string;
	}
): Transform {
	return {
		id: createStreamId(),
		kind: 'transform',
		name,
		description: options?.description,
		status: StreamStatus.Active,
		config: {
			type: TransformType.Limiter,
			inputStreamId,
			maxItems
		}
	};
}

// Validate the DAG structure
export function validateDAG(
	streams: Map<StreamId, Stream>,
	dag: DAG
): DAGValidationResult {
	const errors: DAGValidationError[] = [];
	const warnings: DAGValidationWarning[] = [];

	// Build adjacency list from edges
	const adjacencyList = new Map<string, string[]>();
	for (const edge of dag.edges) {
		const existing = adjacencyList.get(edge.source) ?? [];
		adjacencyList.set(edge.source, [...existing, edge.target]);
	}

	// Check for cycles using DFS
	const visited = new Set<string>();
	const recursionStack = new Set<string>();

	function hasCycle(nodeId: string): boolean {
		visited.add(nodeId);
		recursionStack.add(nodeId);

		const neighbors = adjacencyList.get(nodeId) ?? [];
		for (const neighbor of neighbors) {
			if (!visited.has(neighbor)) {
				if (hasCycle(neighbor)) return true;
			} else if (recursionStack.has(neighbor)) {
				return true;
			}
		}

		recursionStack.delete(nodeId);
		return false;
	}

	for (const node of dag.nodes) {
		if (!visited.has(node.id) && hasCycle(node.id)) {
			errors.push({
				type: 'cycle',
				message: 'The DAG contains a cycle. Content cannot flow in a loop.',
				nodeIds: Array.from(recursionStack)
			});
			break;
		}
	}

	// Check for transforms with missing inputs
	for (const node of dag.nodes) {
		const stream = streams.get(node.id as StreamId);
		if (stream?.kind === 'transform') {
			const inputIds = getInputStreamIds(stream.config);
			const missingInputs = inputIds.filter((id) => !streams.has(id));

			if (missingInputs.length > 0) {
				errors.push({
					type: 'missing_input',
					message: `Transform "${stream.name}" has missing input streams.`,
					nodeIds: [node.id, ...missingInputs]
				});
			}

			// Check for transforms with no actual connections
			const incomingEdges = dag.edges.filter((e) => e.target === node.id);
			if (incomingEdges.length === 0 && inputIds.length > 0) {
				errors.push({
					type: 'disconnected',
					message: `Transform "${stream.name}" has no connected inputs.`,
					nodeIds: [node.id]
				});
			}
		}
	}

	// Check for sources with no outgoing connections (warning)
	const nodesWithOutgoing = new Set(dag.edges.map((e) => e.source));
	for (const node of dag.nodes) {
		const stream = streams.get(node.id as StreamId);
		if (stream?.kind === 'source' && !nodesWithOutgoing.has(node.id)) {
			warnings.push({
				type: 'unused_stream',
				message: `Source "${stream.name}" is not connected to any transform.`,
				nodeIds: [node.id]
			});
		}
	}

	// Check for single-input mixers (warning)
	for (const node of dag.nodes) {
		const stream = streams.get(node.id as StreamId);
		if (stream?.kind === 'transform' && stream.config.type === TransformType.Mixer) {
			const incomingEdges = dag.edges.filter((e) => e.target === node.id);
			if (incomingEdges.length === 1) {
				warnings.push({
					type: 'single_input_mixer',
					message: `Mixer "${stream.name}" has only one input. Consider adding more sources or removing the mixer.`,
					nodeIds: [node.id]
				});
			}
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings
	};
}

// Get topological order of streams for execution
export function getTopologicalOrder(
	streams: Map<StreamId, Stream>,
	dag: DAG
): StreamId[] {
	const inDegree = new Map<string, number>();
	const adjacencyList = new Map<string, string[]>();

	// Initialize
	for (const node of dag.nodes) {
		inDegree.set(node.id, 0);
		adjacencyList.set(node.id, []);
	}

	// Build graph
	for (const edge of dag.edges) {
		const existing = adjacencyList.get(edge.source) ?? [];
		adjacencyList.set(edge.source, [...existing, edge.target]);
		inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
	}

	// Find all nodes with in-degree 0 (sources)
	const queue: string[] = [];
	for (const [nodeId, degree] of inDegree) {
		if (degree === 0) {
			queue.push(nodeId);
		}
	}

	// Process in topological order
	const result: StreamId[] = [];
	while (queue.length > 0) {
		const current = queue.shift()!;
		result.push(current as StreamId);

		const neighbors = adjacencyList.get(current) ?? [];
		for (const neighbor of neighbors) {
			const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
			inDegree.set(neighbor, newDegree);
			if (newDegree === 0) {
				queue.push(neighbor);
			}
		}
	}

	return result;
}

// Find all streams that feed into a given stream
export function getUpstreamStreams(
	streamId: StreamId,
	streams: Map<StreamId, Stream>,
	dag: DAG
): StreamId[] {
	const upstream: Set<StreamId> = new Set();
	const queue: StreamId[] = [streamId];

	while (queue.length > 0) {
		const current = queue.shift()!;
		const incomingEdges = dag.edges.filter((e) => e.target === current);

		for (const edge of incomingEdges) {
			const sourceId = edge.source as StreamId;
			if (!upstream.has(sourceId)) {
				upstream.add(sourceId);
				queue.push(sourceId);
			}
		}
	}

	return Array.from(upstream);
}

// Find all streams that a given stream feeds into
export function getDownstreamStreams(
	streamId: StreamId,
	streams: Map<StreamId, Stream>,
	dag: DAG
): StreamId[] {
	const downstream: Set<StreamId> = new Set();
	const queue: StreamId[] = [streamId];

	while (queue.length > 0) {
		const current = queue.shift()!;
		const outgoingEdges = dag.edges.filter((e) => e.source === current);

		for (const edge of outgoingEdges) {
			const targetId = edge.target as StreamId;
			if (!downstream.has(targetId)) {
				downstream.add(targetId);
				queue.push(targetId);
			}
		}
	}

	return Array.from(downstream);
}
