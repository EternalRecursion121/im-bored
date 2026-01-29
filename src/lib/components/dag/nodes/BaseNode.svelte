<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		icon: string;
		typeName: string;
		isSelected?: boolean;
		isProcessing?: boolean;
		hasError?: boolean;
		itemCount?: number;
		showSourceHandle?: boolean;
		showTargetHandle?: boolean;
		children?: Snippet;
		statusColor?: string;
	}

	let {
		label,
		icon,
		typeName,
		isSelected = false,
		isProcessing = false,
		hasError = false,
		itemCount,
		showSourceHandle = true,
		showTargetHandle = true,
		children,
		statusColor = 'bg-emerald-500'
	}: Props = $props();

	const borderColor = $derived(
		hasError ? 'border-red-500' : isSelected ? 'border-blue-500' : 'border-zinc-700'
	);
</script>

<div
	class="bg-[#1f1f23] rounded-md border {borderColor} min-w-[180px] transition-all duration-200 hover:border-zinc-600"
	class:ring-1={isSelected}
	class:ring-blue-500={isSelected}
>
	{#if showTargetHandle}
		<Handle type="target" position={Position.Left} class="!bg-zinc-500 !w-2.5 !h-2.5" />
	{/if}

	<div class="p-3">
		<div class="flex items-center gap-2 mb-1">
			<div class="w-7 h-7 bg-zinc-800 rounded flex items-center justify-center flex-shrink-0">
				{#if icon === 'rss'}
					<svg class="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
					</svg>
				{:else if icon === 'youtube'}
					<svg class="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
						<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else if icon === 'todoist'}
					<svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{:else if icon === 'mixer'}
					<svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
					</svg>
				{:else if icon === 'filter'}
					<svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
					</svg>
				{:else if icon === 'sorter'}
					<svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
					</svg>
				{:else if icon === 'limiter'}
					<svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
					</svg>
				{:else if icon === 'summarizer' || icon === 'tagger' || icon === 'scorer' || icon === 'semantic'}
					<svg class="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				{:else}
					<svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				{/if}
			</div>
			<div class="flex-1 min-w-0">
				<div class="font-medium text-zinc-100 truncate text-xs">{label}</div>
				<div class="text-xs text-zinc-500">{typeName}</div>
			</div>
			<div class="flex items-center gap-1">
				{#if isProcessing}
					<div class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
				{:else if hasError}
					<div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
				{:else}
					<div class="w-1.5 h-1.5 rounded-full {statusColor}"></div>
				{/if}
			</div>
		</div>

		{#if itemCount !== undefined}
			<div class="text-xs text-zinc-500 mt-1">
				{itemCount} items
			</div>
		{/if}

		{#if children}
			<div class="mt-2 pt-2 border-t border-zinc-700">
				{@render children()}
			</div>
		{/if}
	</div>

	{#if showSourceHandle}
		<Handle type="source" position={Position.Right} class="!bg-blue-500 !w-2.5 !h-2.5" />
	{/if}
</div>
