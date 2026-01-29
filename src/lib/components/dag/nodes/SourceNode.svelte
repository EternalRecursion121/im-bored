<script lang="ts">
	import type { DAGNodeData } from '$lib/types/dag';
	import { getNodeIcon, getTypeName } from '$lib/types/dag';
	import { StreamStatus, type Source } from '$lib/types/streams';
	import BaseNode from './BaseNode.svelte';

	interface Props {
		data: DAGNodeData;
	}

	let { data }: Props = $props();

	const source = $derived(data.stream as Source);
	const icon = $derived(getNodeIcon(source));
	const typeName = $derived(getTypeName(source));

	const statusColor = $derived(() => {
		switch (source.status) {
			case StreamStatus.Active:
				return 'bg-emerald-500';
			case StreamStatus.Fetching:
				return 'bg-amber-500';
			case StreamStatus.Paused:
				return 'bg-zinc-500';
			case StreamStatus.Error:
				return 'bg-red-500';
			default:
				return 'bg-zinc-500';
		}
	});

	const feedUrl = $derived(
		source.config.type === 'rss' ? source.config.feedUrl : ''
	);
</script>

<BaseNode
	label={data.label}
	{icon}
	{typeName}
	isSelected={data.isSelected}
	isProcessing={data.isProcessing}
	hasError={data.hasError}
	itemCount={data.itemCount}
	showTargetHandle={false}
	showSourceHandle={true}
	statusColor={statusColor()}
>
	{#if feedUrl}
		<div class="text-xs text-zinc-500 truncate max-w-[150px] font-mono" title={feedUrl}>
			{feedUrl}
		</div>
	{/if}
</BaseNode>
