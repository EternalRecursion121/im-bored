<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
		class?: string;
	}

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		type = 'button',
		onclick,
		children,
		class: className = ''
	}: Props = $props();

	const baseStyles =
		'inline-flex items-center justify-center font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[--bg-primary] disabled:opacity-50 disabled:cursor-not-allowed';

	const variantStyles = {
		primary: 'bg-[--accent-primary] text-[--bg-primary] hover:brightness-110 focus:ring-[--accent-primary]',
		secondary: 'bg-[--bg-tertiary] text-[--text-primary] hover:bg-[--bg-elevated] focus:ring-[--border-secondary] border border-[--border-primary]',
		ghost: 'bg-transparent text-[--text-secondary] hover:bg-[--bg-tertiary] hover:text-[--text-primary] focus:ring-[--border-secondary]',
		danger: 'bg-[--error] text-[--bg-primary] hover:brightness-110 focus:ring-[--error]'
	};

	const sizeStyles = {
		sm: 'px-2.5 py-1 text-xs',
		md: 'px-3.5 py-1.5 text-sm',
		lg: 'px-5 py-2.5 text-base'
	};

	const computedClass = $derived(
		`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`
	);
</script>

<button
	{type}
	class={computedClass}
	disabled={disabled || loading}
	onclick={onclick}
>
	{#if loading}
		<svg
			class="mr-2 h-4 w-4 animate-spin"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{/if}
	{@render children()}
</button>
