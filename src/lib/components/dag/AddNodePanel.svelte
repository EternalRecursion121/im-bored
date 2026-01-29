<script lang="ts">
	import { Button, Modal, Input, Select } from '$lib/components/ui';
	import { SourceType, TransformType } from '$lib/types/streams';

	interface Props {
		onaddSource?: (type: SourceType, name: string, config: Record<string, unknown>) => void;
		onaddTransform?: (type: TransformType, name: string) => void;
	}

	let { onaddSource, onaddTransform }: Props = $props();

	let showSourceModal = $state(false);
	let showTransformModal = $state(false);

	// Source form state
	let sourceName = $state('');
	let sourceType = $state<SourceType>(SourceType.RSS);
	let feedUrl = $state('');

	// Transform selection
	let selectedTransformType = $state<TransformType | ''>('');

	const sourceTypes = [
		{ value: SourceType.RSS, label: 'RSS Feed' },
		{ value: SourceType.YouTube, label: 'YouTube (Coming Soon)', disabled: true },
		{ value: SourceType.Todoist, label: 'Todoist (Coming Soon)', disabled: true }
	];

	const transformTypes = [
		{ value: TransformType.Mixer, label: 'Mixer', description: 'Combine multiple streams' },
		{ value: TransformType.Filter, label: 'Filter', description: 'Remove items by rules' },
		{ value: TransformType.Sorter, label: 'Sorter', description: 'Reorder items' },
		{ value: TransformType.Limiter, label: 'Limiter', description: 'Limit number of items' }
	];

	function handleAddSource() {
		if (!sourceName || !feedUrl) return;

		onaddSource?.(sourceType, sourceName, { feedUrl });
		resetSourceForm();
		showSourceModal = false;
	}

	function handleAddTransform(type: TransformType) {
		const transformInfo = transformTypes.find((t) => t.value === type);
		const name = transformInfo?.label ?? 'Transform';
		onaddTransform?.(type, name);
		showTransformModal = false;
	}

	function resetSourceForm() {
		sourceName = '';
		sourceType = SourceType.RSS;
		feedUrl = '';
	}
</script>

<div class="flex gap-2">
	<Button variant="primary" onclick={() => (showSourceModal = true)}>
		+ Add Source
	</Button>
	<Button variant="secondary" onclick={() => (showTransformModal = true)}>
		+ Add Transform
	</Button>
</div>

<!-- Add Source Modal -->
<Modal bind:open={showSourceModal} title="Add Source" size="md">
	<form onsubmit={(e) => { e.preventDefault(); handleAddSource(); }} class="space-y-4">
		<Input
			label="Name"
			placeholder="My RSS Feed"
			bind:value={sourceName}
			required
		/>

		<Select
			label="Source Type"
			options={sourceTypes.filter((t) => !t.disabled)}
			bind:value={sourceType}
		/>

		{#if sourceType === SourceType.RSS}
			<Input
				type="url"
				label="Feed URL"
				placeholder="https://example.com/feed.xml"
				bind:value={feedUrl}
				required
			/>
		{/if}

		<div class="flex justify-end gap-2 pt-4">
			<Button variant="ghost" onclick={() => (showSourceModal = false)}>
				Cancel
			</Button>
			<Button type="submit" variant="primary" disabled={!sourceName || !feedUrl}>
				Add Source
			</Button>
		</div>
	</form>
</Modal>

<!-- Add Transform Modal -->
<Modal bind:open={showTransformModal} title="Add Transform" size="md">
	<div class="space-y-2">
		{#each transformTypes as transform}
			<button
				type="button"
				class="w-full p-3 text-left border border-zinc-700 rounded-md hover:border-blue-500 hover:bg-blue-950/30 transition-colors"
				onclick={() => handleAddTransform(transform.value)}
			>
				<div class="font-medium text-zinc-100 text-sm">{transform.label}</div>
				<div class="text-xs text-zinc-500">{transform.description}</div>
			</button>
		{/each}

		<div class="pt-4 border-t border-zinc-700 mt-4">
			<div class="text-xs text-zinc-500 mb-2">AI-Powered (Coming Soon)</div>
			<div class="grid grid-cols-2 gap-2">
				<div class="p-3 border border-zinc-800 rounded-md bg-zinc-800/50 opacity-50">
					<div class="font-medium text-zinc-500 text-xs">AI Summarizer</div>
				</div>
				<div class="p-3 border border-zinc-800 rounded-md bg-zinc-800/50 opacity-50">
					<div class="font-medium text-zinc-500 text-xs">AI Tagger</div>
				</div>
			</div>
		</div>
	</div>

	{#snippet footer()}
		<div class="flex justify-end">
			<Button variant="ghost" onclick={() => (showTransformModal = false)}>
				Cancel
			</Button>
		</div>
	{/snippet}
</Modal>
