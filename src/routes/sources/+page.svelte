<script lang="ts">
	import { getStreamsContext } from '$lib/stores/streams.svelte';
	import { Button, Modal, Input, Select } from '$lib/components/ui';
	import { createRSSSource } from '$lib/dag/builder';
	import { SourceType, StreamStatus, type Source, type RSSSourceConfig } from '$lib/types/streams';
	import { api } from '$lib/api/client';
	import type { StreamId } from '$lib/types/core';

	const streams = getStreamsContext();

	let showAddModal = $state(false);
	let showEditModal = $state(false);
	let editingSource = $state<Source | null>(null);

	// Form state
	let sourceName = $state('');
	let feedUrl = $state('');
	let maxItems = $state(50);
	let refreshInterval = $state(30);

	// Validation state
	let isValidating = $state(false);
	let validationError = $state<string | null>(null);

	async function validateAndAddSource() {
		if (!sourceName || !feedUrl) return;

		isValidating = true;
		validationError = null;

		try {
			const result = await api.validateRSSUrl(feedUrl);
			if (!result.valid) {
				validationError = result.error ?? 'Invalid feed URL';
				return;
			}

			const source = createRSSSource(sourceName, feedUrl, {
				maxItems,
				refreshIntervalMinutes: refreshInterval
			});

			streams.addSource(source);
			resetForm();
			showAddModal = false;
		} catch (err) {
			validationError = err instanceof Error ? err.message : 'Validation failed';
		} finally {
			isValidating = false;
		}
	}

	function editSource(source: Source) {
		editingSource = source;
		sourceName = source.name;

		if (source.config.type === SourceType.RSS) {
			const config = source.config as RSSSourceConfig;
			feedUrl = config.feedUrl;
			maxItems = config.maxItems ?? 50;
			refreshInterval = config.refreshIntervalMinutes ?? 30;
		}

		showEditModal = true;
	}

	function updateSource() {
		if (!editingSource || !sourceName || !feedUrl) return;

		streams.updateStream(editingSource.id, {
			name: sourceName,
			config: {
				type: SourceType.RSS,
				feedUrl,
				maxItems,
				refreshIntervalMinutes: refreshInterval
			}
		});

		resetForm();
		showEditModal = false;
		editingSource = null;
	}

	function deleteSource(id: StreamId) {
		if (confirm('Are you sure you want to delete this source?')) {
			streams.removeStream(id);
		}
	}

	function toggleSourceStatus(source: Source) {
		const newStatus = source.status === StreamStatus.Active
			? StreamStatus.Paused
			: StreamStatus.Active;
		streams.updateStream(source.id, { status: newStatus });
	}

	function resetForm() {
		sourceName = '';
		feedUrl = '';
		maxItems = 50;
		refreshInterval = 30;
		validationError = null;
	}

	function getStatusBadgeClass(status: StreamStatus) {
		switch (status) {
			case StreamStatus.Active:
				return 'bg-[--success]/20 text-[--success]';
			case StreamStatus.Paused:
				return 'bg-[--bg-elevated] text-[--text-secondary]';
			case StreamStatus.Fetching:
				return 'bg-[--accent-primary]/20 text-[--accent-primary]';
			case StreamStatus.Error:
				return 'bg-[--error]/20 text-[--error]';
			default:
				return 'bg-[--bg-elevated] text-[--text-secondary]';
		}
	}
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="flex items-center justify-between mb-6">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: rgba(224, 175, 104, 0.15);">
				<svg class="w-5 h-5" style="color: #e0af68;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
				</svg>
			</div>
			<div>
				<h1 class="text-xl font-semibold text-[--text-primary]">Sources</h1>
				<p class="text-[--text-muted] text-sm">Manage your content sources</p>
			</div>
		</div>
		<Button variant="primary" onclick={() => (showAddModal = true)}>
			+ Add Source
		</Button>
	</div>

	{#if streams.sources.length === 0}
		<div class="text-center py-16 bg-[--bg-tertiary] rounded-lg border border-[--border-primary]">
			<div class="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4" style="background: rgba(224, 175, 104, 0.15);">
				<svg class="w-8 h-8" style="color: #e0af68;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
				</svg>
			</div>
			<h2 class="text-lg font-medium text-[--text-primary] mb-2">No Sources Yet</h2>
			<p class="text-[--text-muted] text-sm mb-5 max-w-md mx-auto">
				Add your first source to start building your personalized feed.
			</p>
			<Button variant="primary" onclick={() => (showAddModal = true)}>
				Add Your First Source
			</Button>
		</div>
	{:else}
		<div class="space-y-3">
			{#each streams.sources as source (source.id)}
				<div class="bg-[--bg-tertiary] rounded-lg border border-[--border-primary] p-5 hover:border-[--border-secondary] transition-colors">
					<div class="flex items-start justify-between">
						<div class="flex items-start gap-4">
							<div class="w-10 h-10 bg-[--bg-elevated] rounded-lg flex items-center justify-center flex-shrink-0">
								{#if source.config.type === SourceType.RSS}
									<svg class="w-5 h-5 text-[--warning]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
									</svg>
								{:else if source.config.type === SourceType.YouTube}
									<svg class="w-5 h-5 text-[--error]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
										<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								{:else if source.config.type === SourceType.Todoist}
									<svg class="w-5 h-5 text-[--success]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								{:else}
									<svg class="w-5 h-5 text-[--text-secondary]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
									</svg>
								{/if}
							</div>
							<div>
								<div class="flex items-center gap-2 mb-1">
									<h3 class="font-medium text-[--text-primary]">{source.name}</h3>
									<span class="px-2 py-0.5 text-xs font-medium rounded {getStatusBadgeClass(source.status)}">
										{source.status}
									</span>
								</div>
								{#if source.config.type === SourceType.RSS}
									<p class="text-sm text-[--text-muted] mb-2 break-all font-mono text-xs">
										{source.config.feedUrl}
									</p>
									<div class="flex items-center gap-4 text-xs text-[--text-muted]">
										<span>Max {source.config.maxItems ?? 50} items</span>
										<span>Refresh every {source.config.refreshIntervalMinutes ?? 30} min</span>
									</div>
								{/if}
								{#if source.lastFetchedAt}
									<p class="text-xs text-[--text-muted] mt-1">
										Last fetched: {new Date(source.lastFetchedAt).toLocaleString()}
									</p>
								{/if}
								{#if source.errorMessage}
									<p class="text-xs text-[--error] mt-1">
										Error: {source.errorMessage}
									</p>
								{/if}
							</div>
						</div>

						<div class="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onclick={() => toggleSourceStatus(source)}
							>
								{source.status === StreamStatus.Active ? 'Pause' : 'Resume'}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => editSource(source)}
							>
								Edit
							</Button>
							<Button
								variant="danger"
								size="sm"
								onclick={() => deleteSource(source.id)}
							>
								Delete
							</Button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Suggested Sources -->
	<div class="mt-8">
		<h2 class="text-sm font-medium mb-3" style="color: #7aa2f7;">Suggested Sources</h2>
		<div class="grid md:grid-cols-2 gap-3">
			<button
				type="button"
				class="bg-[--bg-tertiary] rounded-lg border border-[--border-primary] p-4 text-left hover:border-[#e0af68]/50 hover:bg-[--bg-elevated] hover:shadow-lg hover:shadow-[#e0af68]/5 transition-all group"
				onclick={() => {
					sourceName = 'Hacker News';
					feedUrl = 'https://news.ycombinator.com/rss';
					showAddModal = true;
				}}
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform" style="background: rgba(224, 175, 104, 0.2);">
						<span class="text-sm font-bold" style="color: #e0af68;">Y</span>
					</div>
					<div>
						<h3 class="font-medium text-[--text-primary] text-sm group-hover:text-[#e0af68] transition-colors">Hacker News</h3>
						<p class="text-xs text-[--text-muted]">Tech and startup news</p>
					</div>
				</div>
			</button>

			<button
				type="button"
				class="bg-[--bg-tertiary] rounded-lg border border-[--border-primary] p-4 text-left hover:border-[#f7768e]/50 hover:bg-[--bg-elevated] hover:shadow-lg hover:shadow-[#f7768e]/5 transition-all group"
				onclick={() => {
					sourceName = 'BBC News';
					feedUrl = 'https://feeds.bbci.co.uk/news/rss.xml';
					showAddModal = true;
				}}
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform" style="background: rgba(247, 118, 142, 0.2);">
						<span class="text-sm font-bold" style="color: #f7768e;">B</span>
					</div>
					<div>
						<h3 class="font-medium text-[--text-primary] text-sm group-hover:text-[#f7768e] transition-colors">BBC News</h3>
						<p class="text-xs text-[--text-muted]">UK and world news</p>
					</div>
				</div>
			</button>

			<button
				type="button"
				class="bg-[--bg-tertiary] rounded-lg border border-[--border-primary] p-4 text-left hover:border-[#7aa2f7]/50 hover:bg-[--bg-elevated] hover:shadow-lg hover:shadow-[#7aa2f7]/5 transition-all group"
				onclick={() => {
					sourceName = 'The Guardian';
					feedUrl = 'https://www.theguardian.com/uk/rss';
					showAddModal = true;
				}}
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform" style="background: rgba(122, 162, 247, 0.2);">
						<span class="text-sm font-bold" style="color: #7aa2f7;">G</span>
					</div>
					<div>
						<h3 class="font-medium text-[--text-primary] text-sm group-hover:text-[#7aa2f7] transition-colors">The Guardian</h3>
						<p class="text-xs text-[--text-muted]">UK news and opinion</p>
					</div>
				</div>
			</button>

			<button
				type="button"
				class="bg-[--bg-tertiary] rounded-lg border border-[--border-primary] p-4 text-left hover:border-[#bb9af7]/50 hover:bg-[--bg-elevated] hover:shadow-lg hover:shadow-[#bb9af7]/5 transition-all group"
				onclick={() => {
					sourceName = 'The Independent';
					feedUrl = 'https://www.independent.co.uk/news/uk/rss';
					showAddModal = true;
				}}
			>
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform" style="background: rgba(187, 154, 247, 0.2);">
						<span class="text-sm font-bold" style="color: #bb9af7;">I</span>
					</div>
					<div>
						<h3 class="font-medium text-[--text-primary] text-sm group-hover:text-[#bb9af7] transition-colors">The Independent</h3>
						<p class="text-xs text-[--text-muted]">UK news and analysis</p>
					</div>
				</div>
			</button>
		</div>
	</div>
</div>

<!-- Add Source Modal -->
<Modal bind:open={showAddModal} title="Add Source" size="md" onclose={resetForm}>
	<form onsubmit={(e) => { e.preventDefault(); validateAndAddSource(); }} class="space-y-4">
		<Input
			label="Name"
			placeholder="My RSS Feed"
			bind:value={sourceName}
			required
		/>

		<Input
			type="url"
			label="Feed URL"
			placeholder="https://example.com/feed.xml"
			bind:value={feedUrl}
			error={validationError ?? undefined}
			required
		/>

		<div class="grid grid-cols-2 gap-4">
			<Input
				type="number"
				label="Max Items"
				bind:value={maxItems}
			/>
			<Input
				type="number"
				label="Refresh Interval (min)"
				bind:value={refreshInterval}
			/>
		</div>
	</form>

	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button variant="ghost" onclick={() => { resetForm(); showAddModal = false; }}>
				Cancel
			</Button>
			<Button
				variant="primary"
				onclick={validateAndAddSource}
				loading={isValidating}
				disabled={!sourceName || !feedUrl}
			>
				Add Source
			</Button>
		</div>
	{/snippet}
</Modal>

<!-- Edit Source Modal -->
<Modal bind:open={showEditModal} title="Edit Source" size="md" onclose={() => { resetForm(); editingSource = null; }}>
	<form onsubmit={(e) => { e.preventDefault(); updateSource(); }} class="space-y-4">
		<Input
			label="Name"
			placeholder="My RSS Feed"
			bind:value={sourceName}
			required
		/>

		<Input
			type="url"
			label="Feed URL"
			placeholder="https://example.com/feed.xml"
			bind:value={feedUrl}
			required
		/>

		<div class="grid grid-cols-2 gap-4">
			<Input
				type="number"
				label="Max Items"
				bind:value={maxItems}
			/>
			<Input
				type="number"
				label="Refresh Interval (min)"
				bind:value={refreshInterval}
			/>
		</div>
	</form>

	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button variant="ghost" onclick={() => { resetForm(); showEditModal = false; editingSource = null; }}>
				Cancel
			</Button>
			<Button
				variant="primary"
				onclick={updateSource}
				disabled={!sourceName || !feedUrl}
			>
				Save Changes
			</Button>
		</div>
	{/snippet}
</Modal>
