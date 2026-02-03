<script lang="ts">
	import type { DAGNodeData } from '$lib/types/dag';
	import { getNodeIcon, getTypeName } from '$lib/types/dag';
	import { TransformType, isLLMTransform, type Transform, type MixerConfig } from '$lib/types/streams';
	import BaseNode from './BaseNode.svelte';

	interface Props {
		data: DAGNodeData;
	}

	let { data }: Props = $props();

	const transform = $derived(data.stream as Transform);
	const icon = $derived(getNodeIcon(transform));
	const typeName = $derived(getTypeName(transform));
	const isLLM = $derived(isLLMTransform(transform.config.type));

	const configSummary = $derived(() => {
		const config = transform.config;
		switch (config.type) {
			case TransformType.Mixer:
				return `Strategy: ${(config as MixerConfig).strategy}`;
			case TransformType.Filter:
				return `${config.rules.length} rule(s), ${config.mode}`;
			case TransformType.Sorter:
				return `By ${config.sortBy} (${config.order})`;
			case TransformType.Limiter:
				return `Max ${config.maxItems} items`;
			case TransformType.LLMSummarizer:
				return config.style ?? 'brief';
			case TransformType.LLMTagger:
				return `Max ${config.maxTags ?? 5} tags`;
			case TransformType.LLMRelevanceScorer:
				return `${config.interests.length} interests`;
			case TransformType.LLMSemanticFilter:
				return config.mode;
			default:
				return '';
		}
	});
</script>

<BaseNode
	label={data.label}
	{icon}
	{typeName}
	isSelected={data.isSelected}
	isProcessing={data.isProcessing}
	hasError={data.hasError}
	itemCount={data.itemCount}
	showTargetHandle={true}
	showSourceHandle={true}
	statusColor={isLLM ? 'bg-[#bb9af7]' : 'bg-[#7dcfff]'}
>
	{#if configSummary()}
		<div class="text-xs text-[#565f89]">
			{configSummary()}
		</div>
	{/if}
	{#if isLLM}
		<div class="text-xs text-[#bb9af7] mt-1">
			AI-powered
		</div>
	{/if}
</BaseNode>
