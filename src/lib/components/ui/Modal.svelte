<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title?: string;
		onclose?: () => void;
		children: Snippet;
		footer?: Snippet;
		size?: 'sm' | 'md' | 'lg';
	}

	let { open = $bindable(), title, onclose, children, footer, size = 'md' }: Props = $props();

	const sizeStyles = {
		sm: 'max-w-sm',
		md: 'max-w-lg',
		lg: 'max-w-2xl'
	};

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}

	function close() {
		open = false;
		onclose?.();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'modal-title' : undefined}
	>
		<div class="bg-[--bg-tertiary] rounded-lg shadow-2xl w-full {sizeStyles[size]} max-h-[90vh] flex flex-col border border-[--border-primary]">
			{#if title}
				<div class="flex items-center justify-between px-5 py-4 border-b border-[--border-primary]">
					<h2 id="modal-title" class="text-base font-medium text-[--text-primary]">{title}</h2>
					<button
						type="button"
						class="text-[--text-muted] hover:text-[--text-secondary] transition-colors"
						onclick={close}
						aria-label="Close modal"
					>
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			{/if}

			<div class="px-5 py-4 overflow-y-auto flex-1">
				{@render children()}
			</div>

			{#if footer}
				<div class="px-5 py-4 border-t border-[--border-primary] bg-[--bg-secondary] rounded-b-lg">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
