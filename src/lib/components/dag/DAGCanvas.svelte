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
		onedgeschange?: (edges: DAGEdge[]) => void;
		onconnect?: (sourceId: StreamId, targetId: StreamId) => void;
		onnodeclick?: (nodeId: string) => void;
		onnodedoubleclick?: (nodeId: string) => void;
		onpaneclick?: () => void;
		class?: string;
	}

	let {
		nodes,
		edges,
		onnodeschange,
		onedgeschange,
		onconnect,
		onnodeclick,
		onnodedoubleclick,
		onpaneclick,
		class: className = ''
	}: Props = $props();

	// Define custom node types
	const nodeTypes: NodeTypes = {
		source: SourceNode as unknown as NodeTypes[string],
		transform: TransformNode as unknown as NodeTypes[string],
		output: OutputNode as unknown as NodeTypes[string]
	};

	// Convert our DAG nodes to Svelte Flow nodes
	const flowNodes = $derived<Node[]>(
		nodes.map((node) => ({
			id: node.id,
			type: node.type,
			position: node.position,
			data: node.data as unknown as Record<string, unknown>,
			selectable: node.selectable,
			deletable: node.deletable
		}))
	);

	// Convert our DAG edges to Svelte Flow edges
	const flowEdges = $derived<Edge[]>(
		edges.map((edge) => ({
			id: edge.id,
			source: edge.source,
			target: edge.target,
			type: 'smoothstep',
			animated: edge.animated ?? false
		}))
	);

	function handleConnect(connection: Connection) {
		if (connection.source && connection.target) {
			onconnect?.(connection.source as StreamId, connection.target as StreamId);
		}
	}

	function handleNodeClick({ node }: { node: Node; event: MouseEvent | TouchEvent }) {
		onnodeclick?.(node.id);
	}

	function handleNodeDragStop({ targetNode, nodes: draggedNodes }: { targetNode: Node | null; nodes: Node[]; event: MouseEvent | TouchEvent }) {
		// Update positions after drag
		if (draggedNodes.length > 0) {
			const updatedNodes = nodes.map((node) => {
				const draggedNode = draggedNodes.find((n) => n.id === node.id);
				if (draggedNode) {
					return { ...node, position: draggedNode.position };
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
		defaultEdgeOptions={{
			type: 'smoothstep',
			style: 'stroke-width: 2; stroke: #52525b;'
		}}
	>
		<Background gap={15} color="#27272a" />
		<Controls />
		<MiniMap
			nodeStrokeWidth={3}
			zoomable
			pannable
		/>
	</SvelteFlow>
</div>

<style>
	:global(.svelte-flow) {
		background-color: #0a0a0b;
	}

	:global(.svelte-flow__node) {
		cursor: pointer;
	}

	:global(.svelte-flow__edge-path) {
		stroke: #52525b;
		stroke-width: 2;
	}

	:global(.svelte-flow__edge.selected .svelte-flow__edge-path) {
		stroke: #3b82f6;
	}

	:global(.svelte-flow__handle) {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 2px solid #18181b;
	}

	:global(.svelte-flow__handle-left) {
		left: -5px;
	}

	:global(.svelte-flow__handle-right) {
		right: -5px;
	}

	:global(.svelte-flow__minimap) {
		background-color: #18181b;
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid #27272a;
	}

	:global(.svelte-flow__minimap-mask) {
		fill: rgba(0, 0, 0, 0.6);
	}

	:global(.svelte-flow__controls) {
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid #27272a;
	}

	:global(.svelte-flow__controls-button) {
		background-color: #18181b;
		border-bottom: 1px solid #27272a;
		color: #a1a1aa;
	}

	:global(.svelte-flow__controls-button:hover) {
		background-color: #27272a;
		color: #fafafa;
	}

	:global(.svelte-flow__controls-button svg) {
		fill: currentColor;
	}
</style>
