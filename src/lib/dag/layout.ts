import type { StreamId } from '$lib/types/core';
import type { Stream } from '$lib/types/streams';
import type { DAG, DAGNode, Position } from '$lib/types/dag';

// Layout configuration
export interface LayoutConfig {
	nodeWidth: number;
	nodeHeight: number;
	horizontalGap: number;
	verticalGap: number;
	startX: number;
	startY: number;
}

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
	nodeWidth: 200,
	nodeHeight: 80,
	horizontalGap: 100,
	verticalGap: 40,
	startX: 50,
	startY: 50
};

// Calculate the depth (level) of each node in the DAG
function calculateNodeDepths(dag: DAG): Map<string, number> {
	const depths = new Map<string, number>();
	const adjacencyList = new Map<string, string[]>();

	// Build reverse adjacency list (target -> sources)
	const reverseAdjacencyList = new Map<string, string[]>();

	for (const node of dag.nodes) {
		adjacencyList.set(node.id, []);
		reverseAdjacencyList.set(node.id, []);
	}

	for (const edge of dag.edges) {
		const existing = adjacencyList.get(edge.source) ?? [];
		adjacencyList.set(edge.source, [...existing, edge.target]);

		const reverseExisting = reverseAdjacencyList.get(edge.target) ?? [];
		reverseAdjacencyList.set(edge.target, [...reverseExisting, edge.source]);
	}

	// Find nodes with no incoming edges (sources/roots)
	const roots = dag.nodes.filter((node) => {
		const incoming = reverseAdjacencyList.get(node.id) ?? [];
		return incoming.length === 0;
	});

	// BFS to calculate depths
	for (const root of roots) {
		depths.set(root.id, 0);
	}

	const queue = [...roots.map((r) => r.id)];
	while (queue.length > 0) {
		const current = queue.shift()!;
		const currentDepth = depths.get(current) ?? 0;
		const neighbors = adjacencyList.get(current) ?? [];

		for (const neighbor of neighbors) {
			const existingDepth = depths.get(neighbor) ?? -1;
			if (currentDepth + 1 > existingDepth) {
				depths.set(neighbor, currentDepth + 1);
				queue.push(neighbor);
			}
		}
	}

	return depths;
}

// Group nodes by their depth level
function groupNodesByDepth(dag: DAG, depths: Map<string, number>): Map<number, DAGNode[]> {
	const groups = new Map<number, DAGNode[]>();

	for (const node of dag.nodes) {
		const depth = depths.get(node.id) ?? 0;
		const existing = groups.get(depth) ?? [];
		groups.set(depth, [...existing, node]);
	}

	return groups;
}

// Auto-layout the DAG nodes left-to-right
export function autoLayout(
	dag: DAG,
	config: Partial<LayoutConfig> = {}
): DAGNode[] {
	const layoutConfig = { ...DEFAULT_LAYOUT_CONFIG, ...config };
	const depths = calculateNodeDepths(dag);
	const groups = groupNodesByDepth(dag, depths);

	const newNodes: DAGNode[] = [];

	// Sort groups by depth (left to right)
	const sortedDepths = Array.from(groups.keys()).sort((a, b) => a - b);

	for (const depth of sortedDepths) {
		const nodesAtDepth = groups.get(depth) ?? [];
		const x = layoutConfig.startX + depth * (layoutConfig.nodeWidth + layoutConfig.horizontalGap);

		// Calculate total height for centering
		const totalHeight =
			nodesAtDepth.length * layoutConfig.nodeHeight +
			(nodesAtDepth.length - 1) * layoutConfig.verticalGap;
		let y = layoutConfig.startY;

		for (let i = 0; i < nodesAtDepth.length; i++) {
			const node = nodesAtDepth[i];
			const position: Position = {
				x,
				y: y + i * (layoutConfig.nodeHeight + layoutConfig.verticalGap)
			};

			newNodes.push({
				...node,
				position
			});
		}
	}

	return newNodes;
}

// Calculate positions for adding a new node
export function calculateNewNodePosition(
	dag: DAG,
	nodeType: 'source' | 'transform',
	config: Partial<LayoutConfig> = {}
): Position {
	const layoutConfig = { ...DEFAULT_LAYOUT_CONFIG, ...config };

	if (dag.nodes.length === 0) {
		return { x: layoutConfig.startX, y: layoutConfig.startY };
	}

	if (nodeType === 'source') {
		// Sources go on the left - find the lowest source position
		const sources = dag.nodes.filter((n) => n.type === 'source');
		if (sources.length === 0) {
			return { x: layoutConfig.startX, y: layoutConfig.startY };
		}

		const maxY = Math.max(...sources.map((s) => s.position.y));
		return {
			x: layoutConfig.startX,
			y: maxY + layoutConfig.nodeHeight + layoutConfig.verticalGap
		};
	} else {
		// Transforms go to the right - find the rightmost column
		const maxX = Math.max(...dag.nodes.map((n) => n.position.x));
		const nodesAtMaxX = dag.nodes.filter((n) => n.position.x === maxX);
		const maxY = Math.max(...nodesAtMaxX.map((n) => n.position.y));

		// Check if we should add to existing column or create new one
		if (nodesAtMaxX.length < 3) {
			return {
				x: maxX,
				y: maxY + layoutConfig.nodeHeight + layoutConfig.verticalGap
			};
		} else {
			return {
				x: maxX + layoutConfig.nodeWidth + layoutConfig.horizontalGap,
				y: layoutConfig.startY
			};
		}
	}
}

// Fit all nodes within a viewport
export function fitToViewport(
	nodes: DAGNode[],
	viewportWidth: number,
	viewportHeight: number,
	padding: number = 50
): { nodes: DAGNode[]; scale: number; translateX: number; translateY: number } {
	if (nodes.length === 0) {
		return { nodes, scale: 1, translateX: 0, translateY: 0 };
	}

	// Calculate bounding box
	const minX = Math.min(...nodes.map((n) => n.position.x));
	const maxX = Math.max(...nodes.map((n) => n.position.x + DEFAULT_LAYOUT_CONFIG.nodeWidth));
	const minY = Math.min(...nodes.map((n) => n.position.y));
	const maxY = Math.max(...nodes.map((n) => n.position.y + DEFAULT_LAYOUT_CONFIG.nodeHeight));

	const contentWidth = maxX - minX;
	const contentHeight = maxY - minY;

	// Calculate scale to fit
	const scaleX = (viewportWidth - 2 * padding) / contentWidth;
	const scaleY = (viewportHeight - 2 * padding) / contentHeight;
	const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 1

	// Calculate translation to center
	const translateX = padding + (viewportWidth - 2 * padding - contentWidth * scale) / 2 - minX * scale;
	const translateY = padding + (viewportHeight - 2 * padding - contentHeight * scale) / 2 - minY * scale;

	return { nodes, scale, translateX, translateY };
}
