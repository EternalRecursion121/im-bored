import { getContext, setContext } from 'svelte';
import type { StreamId } from '$lib/types/core';
import type {
	Stream,
	Source,
	Transform,
	TransformConfig
} from '$lib/types/streams';
import { getInputStreamIds } from '$lib/types/streams';
import type { DAG, DAGNode, DAGEdge, Position } from '$lib/types/dag';
import { createSourceNode, createTransformNode, createEdge } from '$lib/types/dag';

const STREAMS_CONTEXT_KEY = Symbol('streams');

export interface StreamsState {
	streams: Map<StreamId, Stream>;
	dag: DAG;
	selectedStreamId: StreamId | null;
	outputStreamId: StreamId | null;
}

function createStreamsStore() {
	let streams = $state<Map<StreamId, Stream>>(new Map());
	let nodes = $state<DAGNode[]>([]);
	let edges = $state<DAGEdge[]>([]);
	let selectedStreamId = $state<StreamId | null>(null);
	let outputStreamId = $state<StreamId | null>(null);

	// Derived: get all sources
	const sources = $derived(
		Array.from(streams.values()).filter((s): s is Source => s.kind === 'source')
	);

	// Derived: get all transforms
	const transforms = $derived(
		Array.from(streams.values()).filter((s): s is Transform => s.kind === 'transform')
	);

	// Derived: get selected stream
	const selectedStream = $derived(
		selectedStreamId ? streams.get(selectedStreamId) ?? null : null
	);

	// Derived: get output stream
	const outputStream = $derived(
		outputStreamId ? streams.get(outputStreamId) ?? null : null
	);

	// Derived: DAG object
	const dag = $derived<DAG>({
		nodes,
		edges,
		outputStreamId: outputStreamId ?? undefined
	});

	function addSource(source: Source, position?: Position) {
		streams.set(source.id, source);
		const pos = position ?? { x: 50, y: nodes.length * 120 + 50 };
		nodes = [...nodes, createSourceNode(source, pos)];
	}

	function addTransform(transform: Transform, position?: Position) {
		streams.set(transform.id, transform);
		const pos = position ?? { x: 300, y: nodes.length * 120 + 50 };
		nodes = [...nodes, createTransformNode(transform, pos)];

		// Auto-create edges based on input stream IDs
		const inputIds = getInputStreamIds(transform.config);
		const newEdges = inputIds
			.filter((id) => streams.has(id))
			.map((inputId) => createEdge(inputId, transform.id));
		edges = [...edges, ...newEdges];
	}

	function updateStream(id: StreamId, updates: Partial<Stream>) {
		const existing = streams.get(id);
		if (existing) {
			const updated = { ...existing, ...updates } as Stream;
			streams.set(id, updated);
			// Update node data
			nodes = nodes.map((node) =>
				node.id === id
					? { ...node, data: { ...node.data, stream: updated, label: updated.name } }
					: node
			);
		}
	}

	function removeStream(id: StreamId) {
		streams.delete(id);
		nodes = nodes.filter((node) => node.id !== id);
		edges = edges.filter((edge) => edge.source !== id && edge.target !== id);

		if (selectedStreamId === id) {
			selectedStreamId = null;
		}
		if (outputStreamId === id) {
			outputStreamId = null;
		}
	}

	function setSelectedStream(id: StreamId | null) {
		selectedStreamId = id;
		nodes = nodes.map((node) => ({
			...node,
			data: { ...node.data, isSelected: node.id === id }
		}));
	}

	function setOutputStream(id: StreamId | null) {
		outputStreamId = id;
	}

	function addEdge(sourceId: StreamId, targetId: StreamId) {
		// Prevent duplicate edges
		const exists = edges.some((e) => e.source === sourceId && e.target === targetId);
		if (!exists) {
			edges = [...edges, createEdge(sourceId, targetId)];

			// Update the transform's input stream IDs
			const targetStream = streams.get(targetId);
			if (targetStream?.kind === 'transform') {
				const config = targetStream.config as TransformConfig;
				if ('inputStreamIds' in config) {
					// Mixer
					config.inputStreamIds = [...config.inputStreamIds, sourceId];
				} else if ('inputStreamId' in config) {
					// Single input transforms - replace the existing input
					(config as { inputStreamId: StreamId }).inputStreamId = sourceId;
				}
				updateStream(targetId, { config } as Partial<Transform>);
			}
		}
	}

	function removeEdge(sourceId: StreamId, targetId: StreamId) {
		edges = edges.filter((e) => !(e.source === sourceId && e.target === targetId));

		// Update the transform's input stream IDs
		const targetStream = streams.get(targetId);
		if (targetStream?.kind === 'transform') {
			const config = { ...targetStream.config } as TransformConfig;
			if ('inputStreamIds' in config) {
				config.inputStreamIds = config.inputStreamIds.filter((id) => id !== sourceId);
			}
			updateStream(targetId, { config } as Partial<Transform>);
		}
	}

	function updateNodePosition(id: string, position: Position) {
		nodes = nodes.map((node) =>
			node.id === id ? { ...node, position } : node
		);
	}

	function updateNodes(newNodes: DAGNode[]) {
		nodes = newNodes;
	}

	function updateEdges(newEdges: DAGEdge[]) {
		edges = newEdges;
	}

	function clear() {
		streams = new Map();
		nodes = [];
		edges = [];
		selectedStreamId = null;
		outputStreamId = null;
	}

	return {
		// State getters
		get streams() {
			return streams;
		},
		get nodes() {
			return nodes;
		},
		get edges() {
			return edges;
		},
		get sources() {
			return sources;
		},
		get transforms() {
			return transforms;
		},
		get selectedStreamId() {
			return selectedStreamId;
		},
		get selectedStream() {
			return selectedStream;
		},
		get outputStreamId() {
			return outputStreamId;
		},
		get outputStream() {
			return outputStream;
		},
		get dag() {
			return dag;
		},

		// Actions
		addSource,
		addTransform,
		updateStream,
		removeStream,
		setSelectedStream,
		setOutputStream,
		addEdge,
		removeEdge,
		updateNodePosition,
		updateNodes,
		updateEdges,
		clear
	};
}

export type StreamsStore = ReturnType<typeof createStreamsStore>;

export function createStreamsContext() {
	const store = createStreamsStore();
	setContext(STREAMS_CONTEXT_KEY, store);
	return store;
}

export function getStreamsContext(): StreamsStore {
	const store = getContext<StreamsStore>(STREAMS_CONTEXT_KEY);
	if (!store) {
		throw new Error('StreamsStore not found in context. Did you forget to call createStreamsContext?');
	}
	return store;
}
