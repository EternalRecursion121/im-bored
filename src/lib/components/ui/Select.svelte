<script lang="ts">
	import { nanoid } from 'nanoid';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		value?: string;
		options: Option[];
		placeholder?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		id?: string;
		name?: string;
		onchange?: (e: Event & { currentTarget: HTMLSelectElement }) => void;
		class?: string;
	}

	let {
		value = $bindable(''),
		options,
		placeholder,
		label,
		error,
		disabled = false,
		required = false,
		id,
		name,
		onchange,
		class: className = ''
	}: Props = $props();

	const generatedId = nanoid(8);
	const selectId = $derived(id ?? `select-${generatedId}`);
</script>

<div class="w-full {className}">
	{#if label}
		<label for={selectId} class="block text-sm font-medium text-zinc-300 mb-1.5">
			{label}
			{#if required}
				<span class="text-red-400">*</span>
			{/if}
		</label>
	{/if}

	<select
		id={selectId}
		{name}
		bind:value
		{disabled}
		{required}
		{onchange}
		class="w-full px-3 py-2 border rounded-md bg-[#111113] text-zinc-100 transition-colors
			focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
			disabled:bg-zinc-900 disabled:text-zinc-500 disabled:cursor-not-allowed
			{error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-zinc-700'}"
		aria-invalid={error ? 'true' : 'false'}
		aria-describedby={error ? `${selectId}-error` : undefined}
	>
		{#if placeholder}
			<option value="" disabled class="text-zinc-500">{placeholder}</option>
		{/if}
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>

	{#if error}
		<p id="{selectId}-error" class="mt-1.5 text-sm text-red-400">{error}</p>
	{/if}
</div>
