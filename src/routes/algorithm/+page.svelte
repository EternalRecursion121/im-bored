<script lang="ts">
	import { getStreamsContext } from '$lib/stores/streams.svelte';
	import { DAGCanvas, AddNodePanel } from '$lib/components/dag';
	import { Button, Modal } from '$lib/components/ui';
	import { createRSSSource, createMixer, createFilter, createSorter, createLimiter, validateDAG } from '$lib/dag/builder';
	import { autoLayout } from '$lib/dag/layout';
	import { SourceType, TransformType, StreamStatus } from '$lib/types/streams';
	import type { StreamId } from '$lib/types/core';
	import type { DAGNode } from '$lib/types/dag';

	const streams = getStreamsContext();

	let showValidationModal = $state(false);
	let validationResult = $state<ReturnType<typeof validateDAG> | null>(null);

	function handleAddSource(type: SourceType, name: string, config: Record<string, unknown>) {
		if (type === SourceType.RSS && config.feedUrl) {
			const source = createRSSSource(name, config.feedUrl as string);
			streams.addSource(source);
		}
	}

	function handleAddTransform(type: TransformType, name: string) {
		const selectedId = streams.selectedStreamId;

		switch (type) {
			case TransformType.Mixer: {
				const mixer = createMixer(
					name,
					selectedId ? [selectedId] : [],
					{ strategy: 'interleave' }
				);
				streams.addTransform(mixer);
				break;
			}
			case TransformType.Filter: {
				if (selectedId) {
					const filter = createFilter(name, selectedId, [], { mode: 'exclude' });
					streams.addTransform(filter);
				}
				break;
			}
			case TransformType.Sorter: {
				if (selectedId) {
					const sorter = createSorter(name, selectedId, 'publishedAt');
					streams.addTransform(sorter);
				}
				break;
			}
			case TransformType.Limiter: {
				if (selectedId) {
					const limiter = createLimiter(name, selectedId, 20);
					streams.addTransform(limiter);
				}
				break;
			}
		}
	}

	function handleConnect(sourceId: StreamId, targetId: StreamId) {
		streams.addEdge(sourceId, targetId);
	}

	function handleNodeClick(nodeId: string) {
		streams.setSelectedStream(nodeId as StreamId);
	}

	function handlePaneClick() {
		streams.setSelectedStream(null);
	}

	function handleNodesChange(nodes: DAGNode[]) {
		streams.updateNodes(nodes);
	}

	function handleAutoLayout() {
		const newNodes = autoLayout(streams.dag);
		streams.updateNodes(newNodes);
	}

	function handleValidate() {
		validationResult = validateDAG(streams.streams, streams.dag);
		showValidationModal = true;
	}

	function handleSetOutput() {
		if (streams.selectedStreamId) {
			streams.setOutputStream(streams.selectedStreamId);
		}
	}

	function handleDeleteSelected() {
		if (streams.selectedStreamId) {
			streams.removeStream(streams.selectedStreamId);
		}
	}
</script>

<div class="h-[calc(100vh-3.5rem)] flex flex-col">
	<!-- Toolbar -->
	<div class="bg-[--bg-secondary] border-b border-[--border-primary] px-4 py-2.5 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<div class="w-7 h-7 rounded-md flex items-center justify-center" style="background: rgba(187, 154, 247, 0.2);">
					<svg class="w-4 h-4" style="color: #bb9af7;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
					</svg>
				</div>
				<h1 class="text-sm font-medium text-[--text-primary]">Algorithm Editor</h1>
			</div>
			<AddNodePanel
				onaddSource={handleAddSource}
				onaddTransform={handleAddTransform}
			/>
		</div>

		<div class="flex items-center gap-2">
			{#if streams.selectedStreamId}
				<Button
					variant="secondary"
					size="sm"
					onclick={handleSetOutput}
				>
					Set as Output
				</Button>
				<Button
					variant="danger"
					size="sm"
					onclick={handleDeleteSelected}
				>
					Delete
				</Button>
			{/if}
			<Button variant="ghost" size="sm" onclick={handleAutoLayout}>
				Auto Layout
			</Button>
			<Button variant="secondary" size="sm" onclick={handleValidate}>
				Validate
			</Button>
		</div>
	</div>

	<!-- DAG Canvas -->
	<div class="flex-1 relative bg-[--bg-primary]">
		{#if streams.nodes.length === 0}
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="text-center">
					<div class="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4" style="background: rgba(187, 154, 247, 0.15);">
						<svg class="w-8 h-8" style="color: #bb9af7;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
						</svg>
					</div>
					<h2 class="text-lg font-medium text-[--text-primary] mb-2">Build Your Algorithm</h2>
					<p class="text-[--text-muted] text-sm mb-5 max-w-md">
						Add sources and transforms to create your personalized content pipeline.
						Connect nodes by dragging from the output handle to the input handle.
					</p>
					<AddNodePanel
						onaddSource={handleAddSource}
						onaddTransform={handleAddTransform}
					/>
				</div>
			</div>
		{:else}
			<DAGCanvas
				nodes={streams.nodes}
				edges={streams.edges}
				onnodeschange={handleNodesChange}
				onconnect={handleConnect}
				onnodeclick={handleNodeClick}
				onpaneclick={handlePaneClick}
			/>
		{/if}
	</div>

	<!-- Status Bar -->
	<div class="bg-[--bg-secondary] border-t border-[--border-primary] px-4 py-2 flex items-center justify-between text-xs">
		<div class="flex items-center gap-4 text-[--text-muted]">
			<span>{streams.sources.length} sources</span>
			<span>{streams.transforms.length} transforms</span>
			<span>{streams.nodes.length} nodes</span>
			<span>{streams.edges.length} connections</span>
		</div>
		{#if streams.outputStreamId}
			<div class="flex items-center gap-2 text-[--success]">
				<span class="w-1.5 h-1.5 bg-[--success] rounded-full"></span>
				<span>Output: {streams.outputStream?.name}</span>
			</div>
		{:else}
			<div class="text-[--text-muted]">
				No output selected
			</div>
		{/if}
	</div>
</div>

<!-- Validation Modal -->
<Modal bind:open={showValidationModal} title="DAG Validation" size="md">
	{#if validationResult}
		{#if validationResult.isValid}
			<div class="text-center py-4">
				<div class="w-12 h-12 bg-[--success]/20 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-6 h-6 text-[--success]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<h3 class="text-base font-medium text-[--success]">DAG is Valid</h3>
				<p class="text-[--text-muted] text-sm mt-2">Your content pipeline is correctly configured.</p>
			</div>
		{:else}
			<div class="space-y-4">
				<div class="text-center py-2">
					<div class="w-12 h-12 bg-[--error]/20 rounded-full flex items-center justify-center mx-auto mb-3">
						<svg class="w-6 h-6 text-[--error]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</div>
					<h3 class="text-base font-medium text-[--error]">Validation Failed</h3>
				</div>

				{#if validationResult.errors.length > 0}
					<div class="space-y-2">
						<h4 class="text-sm font-medium text-[--error]">Errors</h4>
						{#each validationResult.errors as error}
							<div class="bg-[--error]/10 border border-[--error]/30 rounded-lg p-3">
								<p class="text-sm text-[--error]">{error.message}</p>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		{#if validationResult.warnings.length > 0}
			<div class="mt-4 space-y-2">
				<h4 class="text-sm font-medium text-[--warning]">Warnings</h4>
				{#each validationResult.warnings as warning}
					<div class="bg-[--warning]/10 border border-[--warning]/30 rounded-lg p-3">
						<p class="text-sm text-[--warning]">{warning.message}</p>
					</div>
				{/each}
			</div>
		{/if}
	{/if}

	{#snippet footer()}
		<div class="flex justify-end">
			<Button variant="primary" onclick={() => (showValidationModal = false)}>
				Close
			</Button>
		</div>
	{/snippet}
</Modal>
