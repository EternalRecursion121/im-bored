<script lang="ts">
	import { nanoid } from 'nanoid';

	interface Props {
		type?: 'text' | 'email' | 'password' | 'url' | 'number';
		value?: string | number;
		placeholder?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		id?: string;
		name?: string;
		oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
		onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
		class?: string;
	}

	let {
		type = 'text',
		value = $bindable(''),
		placeholder,
		label,
		error,
		disabled = false,
		required = false,
		id,
		name,
		oninput,
		onchange,
		class: className = ''
	}: Props = $props();

	const generatedId = nanoid(8);
	const inputId = $derived(id ?? `input-${generatedId}`);
</script>

<div class="w-full {className}">
	{#if label}
		<label for={inputId} class="block text-sm font-medium text-zinc-300 mb-1.5">
			{label}
			{#if required}
				<span class="text-red-400">*</span>
			{/if}
		</label>
	{/if}

	<input
		{type}
		id={inputId}
		{name}
		bind:value
		{placeholder}
		{disabled}
		{required}
		{oninput}
		{onchange}
		class="w-full px-3 py-2 border rounded-md bg-[#111113] text-zinc-100 placeholder-zinc-600 transition-colors
			focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
			disabled:bg-zinc-900 disabled:text-zinc-500 disabled:cursor-not-allowed
			{error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-zinc-700'}"
		aria-invalid={error ? 'true' : 'false'}
		aria-describedby={error ? `${inputId}-error` : undefined}
	/>

	{#if error}
		<p id="{inputId}-error" class="mt-1.5 text-sm text-red-400">{error}</p>
	{/if}
</div>
