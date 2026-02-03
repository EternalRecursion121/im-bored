<script lang="ts">
	import type { DAGNodeData } from '$lib/types/dag';
	import BaseNode from './BaseNode.svelte';

	interface Props {
		data: DAGNodeData;
	}

	let { data }: Props = $props();
</script>

<BaseNode
	label={data.label}
	icon="📤"
	typeName="Output"
	isSelected={data.isSelected}
	isProcessing={data.isProcessing}
	hasError={data.hasError}
	itemCount={data.itemCount}
	showTargetHandle={true}
	showSourceHandle={false}
	statusColor="bg-[#9ece6a]"
>
	<div class="text-xs text-[#9ece6a]">
		Your personalized feed
	</div>
</BaseNode>
