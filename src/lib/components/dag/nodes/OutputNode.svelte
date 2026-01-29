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
	statusColor="bg-emerald-500"
>
	<div class="text-xs text-emerald-600">
		Your personalized feed
	</div>
</BaseNode>
