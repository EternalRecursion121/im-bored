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
				return 'bg-[#9ece6a]';
			case StreamStatus.Fetching:
				return 'bg-[#e0af68]';
			case StreamStatus.Paused:
				return 'bg-[#565f89]';
			case StreamStatus.Error:
				return 'bg-[#f7768e]';
			default:
				return 'bg-[#565f89]';
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
		<div class="text-xs text-[#565f89] truncate max-w-[150px] font-mono" title={feedUrl}>
			{feedUrl}
		</div>
	{/if}
</BaseNode>
