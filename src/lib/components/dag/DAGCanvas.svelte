<script lang="ts">
	import {
		SvelteFlow,
		Background,
		Controls,
		MiniMap,
		type Node,
		type Edge,
		type NodeTypes,
		type Connection
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';

	import { SourceNode, TransformNode, OutputNode } from './nodes';
	import type { DAGNode, DAGEdge } from '$lib/types/dag';
	import type { StreamId } from '$lib/types/core';

	interface Props {
		nodes: DAGNode[];
		edges: DAGEdge[];
		onnodeschange?: (nodes: DAGNode[]) => void;
		onconnect?: (sourceId: StreamId, targetId: StreamId) => void;
		onnodeclick?: (nodeId: string) => void;
		onpaneclick?: () => void;
		class?: string;
	}

	let {
		nodes,
		edges,
		onnodeschange,
		onconnect,
		onnodeclick,
		onpaneclick,
		class: className = ''
	}: Props = $props();

	// Define custom node types
	const nodeTypes: NodeTypes = {
		source: SourceNode as unknown as NodeTypes[string],
		transform: TransformNode as unknown as NodeTypes[string],
		output: OutputNode as unknown as NodeTypes[string]
	};

	// Convert nodes to SvelteFlow format
	let flowNodes = $state<Node[]>([]);
	let flowEdges = $state<Edge[]>([]);

	$effect(() => {
		flowNodes = nodes.map((node) => ({
			id: node.id,
			type: node.type,
			position: { x: node.position.x, y: node.position.y },
			data: { ...node.data },
			selectable: true,
			deletable: true
		}));
	});

	$effect(() => {
		flowEdges = edges.map((edge) => ({
			id: edge.id,
			source: edge.source,
			target: edge.target,
			type: 'smoothstep',
			animated: edge.animated ?? false
		}));
	});

	function handleConnect(connection: Connection) {
		if (connection.source && connection.target) {
			onconnect?.(connection.source as StreamId, connection.target as StreamId);
		}
	}

	function handleNodeClick(event: { node: Node }) {
		onnodeclick?.(event.node.id);
	}

	function handleNodeDragStop(event: { nodes: Node[] }) {
		if (event.nodes.length > 0) {
			const updatedNodes = nodes.map((node) => {
				const draggedNode = event.nodes.find((n) => n.id === node.id);
				if (draggedNode) {
					return { ...node, position: { x: draggedNode.position.x, y: draggedNode.position.y } };
				}
				return node;
			});
			onnodeschange?.(updatedNodes);
		}
	}

	function handlePaneClick() {
		onpaneclick?.();
	}
</script>

<div class="w-full h-full {className}">
	<SvelteFlow
		nodes={flowNodes}
		edges={flowEdges}
		{nodeTypes}
		onconnect={handleConnect}
		onnodeclick={handleNodeClick}
		onnodedragstop={handleNodeDragStop}
		onpaneclick={handlePaneClick}
		fitView
		snapGrid={[15, 15]}
		minZoom={0.1}
		maxZoom={2}
		defaultEdgeOptions={{
			type: 'smoothstep',
			style: 'stroke-width: 2; stroke: #3b4261;'
		}}
	>
		<Background gap={15} color="#292e42" />
		<Controls />
		<MiniMap nodeStrokeWidth={3} zoomable pannable />
	</SvelteFlow>
</div>

<style>
	:global(.svelte-flow) {
		background-color: #1a1b26 !important;
	}

	:global(.svelte-flow__renderer) {
		background-color: #1a1b26 !important;
	}

	:global(.svelte-flow__pane) {
		background-color: #1a1b26 !important;
	}

	:global(.svelte-flow__node) {
		cursor: pointer;
	}

	:global(.svelte-flow__edge-path) {
		stroke: #3b4261;
		stroke-width: 2;
	}

	:global(.svelte-flow__edge.selected .svelte-flow__edge-path) {
		stroke: #7aa2f7;
	}

	:global(.svelte-flow__handle) {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid #1a1b26;
	}

	:global(.svelte-flow__minimap) {
		background-color: #1f2335;
		border-radius: 6px;
		border: 1px solid #292e42;
	}

	:global(.svelte-flow__controls) {
		border-radius: 6px;
		border: 1px solid #292e42;
	}

	:global(.svelte-flow__controls-button) {
		background-color: #1f2335;
		border-bottom: 1px solid #292e42;
		color: #a9b1d6;
	}

	:global(.svelte-flow__controls-button:hover) {
		background-color: #292e42;
	}

	:global(.svelte-flow__controls-button svg) {
		fill: currentColor;
	}
</style>
