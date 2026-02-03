<script lang="ts">
	import { getStreamsContext } from '$lib/stores/streams.svelte';
	import { getContentContext } from '$lib/stores/content.svelte';
	import { getFeedbackContext } from '$lib/stores/feedback.svelte';
	import { Button } from '$lib/components/ui';

	const streams = getStreamsContext();
	const content = getContentContext();
	const feedback = getFeedbackContext();

	// Tokyo Night colors
	const colors = {
		blue: '#7aa2f7',
		purple: '#bb9af7',
		cyan: '#7dcfff',
		green: '#9ece6a',
		pink: '#f7768e',
		orange: '#e0af68',
		blueBg: 'rgba(122, 162, 247, 0.15)',
		purpleBg: 'rgba(187, 154, 247, 0.15)',
		cyanBg: 'rgba(125, 207, 255, 0.15)',
		greenBg: 'rgba(158, 206, 106, 0.15)',
		pinkBg: 'rgba(247, 118, 142, 0.15)',
	};

	const stats = $derived({
		sources: streams.sources.length,
		transforms: streams.transforms.length,
		items: content.allItems.length,
		likes: feedback.feedbackCounts.like,
		dislikes: feedback.feedbackCounts.dislike
	});
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="mb-8">
		<h1 class="font-display text-2xl font-semibold text-[--text-primary] mb-1">Dashboard</h1>
		<p class="text-[--text-muted] text-sm">
			Your content, your rules. No mysterious algorithms here.
		</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
		<div class="bg-[--bg-tertiary] rounded-lg p-4 border border-[--border-primary] hover:border-[--border-secondary] transition-colors">
			<div class="w-8 h-8 rounded-md flex items-center justify-center mb-3" style:background={colors.blueBg}>
				<svg class="w-4 h-4" style:color={colors.blue} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
				</svg>
			</div>
			<div class="font-display text-2xl font-semibold text-[--text-primary]">{stats.sources}</div>
			<div class="text-xs text-[--text-muted]">Sources</div>
		</div>
		<div class="bg-[--bg-tertiary] rounded-lg p-4 border border-[--border-primary] hover:border-[--border-secondary] transition-colors">
			<div class="w-8 h-8 rounded-md flex items-center justify-center mb-3" style:background={colors.purpleBg}>
				<svg class="w-4 h-4" style:color={colors.purple} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</div>
			<div class="font-display text-2xl font-semibold text-[--text-primary]">{stats.transforms}</div>
			<div class="text-xs text-[--text-muted]">Transforms</div>
		</div>
		<div class="bg-[--bg-tertiary] rounded-lg p-4 border border-[--border-primary] hover:border-[--border-secondary] transition-colors">
			<div class="w-8 h-8 rounded-md flex items-center justify-center mb-3" style:background={colors.cyanBg}>
				<svg class="w-4 h-4" style:color={colors.cyan} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</div>
			<div class="font-display text-2xl font-semibold text-[--text-primary]">{stats.items}</div>
			<div class="text-xs text-[--text-muted]">Content Items</div>
		</div>
		<div class="bg-[--bg-tertiary] rounded-lg p-4 border border-[--border-primary] hover:border-[--border-secondary] transition-colors">
			<div class="w-8 h-8 rounded-md flex items-center justify-center mb-3" style:background={colors.greenBg}>
				<svg class="w-4 h-4" style:color={colors.green} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
				</svg>
			</div>
			<div class="font-display text-2xl font-semibold" style:color={colors.green}>{stats.likes}</div>
			<div class="text-xs text-[--text-muted]">Likes</div>
		</div>
		<div class="bg-[--bg-tertiary] rounded-lg p-4 border border-[--border-primary] hover:border-[--border-secondary] transition-colors">
			<div class="w-8 h-8 rounded-md flex items-center justify-center mb-3" style:background={colors.pinkBg}>
				<svg class="w-4 h-4" style:color={colors.pink} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
				</svg>
			</div>
			<div class="font-display text-2xl font-semibold" style:color={colors.pink}>{stats.dislikes}</div>
			<div class="text-xs text-[--text-muted]">Dislikes</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="grid md:grid-cols-3 gap-4 mb-8">
		<a
			href="/sources"
			class="bg-[--bg-tertiary] rounded-lg p-5 border-2 border-[--border-primary] hover:border-[#7aa2f7] hover:bg-[--bg-elevated] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#7aa2f7]/10 transition-all duration-200 group cursor-pointer"
		>
			<div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style:background={colors.blueBg}>
				<svg class="w-5 h-5" style:color={colors.blue} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
				</svg>
			</div>
			<h3 class="font-display text-base font-medium text-[--text-primary] mb-1 group-hover:text-[#7aa2f7] transition-colors">Add Sources</h3>
			<p class="text-[--text-muted] text-sm">
				Connect RSS feeds, YouTube channels, or Todoist.
			</p>
		</a>

		<a
			href="/algorithm"
			class="bg-[--bg-tertiary] rounded-lg p-5 border-2 border-[--border-primary] hover:border-[#bb9af7] hover:bg-[--bg-elevated] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#bb9af7]/10 transition-all duration-200 group cursor-pointer"
		>
			<div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style:background={colors.purpleBg}>
				<svg class="w-5 h-5" style:color={colors.purple} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
				</svg>
			</div>
			<h3 class="font-display text-base font-medium text-[--text-primary] mb-1 group-hover:text-[#bb9af7] transition-colors">Configure Algorithm</h3>
			<p class="text-[--text-muted] text-sm">
				Design your content flow with the visual editor.
			</p>
		</a>

		<a
			href="/feed"
			class="bg-[--bg-tertiary] rounded-lg p-5 border-2 border-[--border-primary] hover:border-[#7dcfff] hover:bg-[--bg-elevated] hover:scale-[1.02] hover:shadow-lg hover:shadow-[#7dcfff]/10 transition-all duration-200 group cursor-pointer"
		>
			<div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style:background={colors.cyanBg}>
				<svg class="w-5 h-5" style:color={colors.cyan} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
				</svg>
			</div>
			<h3 class="font-display text-base font-medium text-[--text-primary] mb-1 group-hover:text-[#7dcfff] transition-colors">View Feed</h3>
			<p class="text-[--text-muted] text-sm">
				See your personalized content and give feedback.
			</p>
		</a>
	</div>

	<!-- Getting Started Guide -->
	{#if stats.sources === 0}
		<div class="bg-[--bg-tertiary] rounded-lg p-5 border border-[--border-primary]">
			<h2 class="font-display text-base font-medium mb-4" style:color={colors.blue}>Getting Started</h2>
			<ol class="space-y-4">
				<li class="flex items-start gap-3">
					<span class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5" style:background={colors.blue} style:color="#1a1b26">
						1
					</span>
					<div>
						<span class="font-medium text-[--text-primary] text-sm">Add your first source</span>
						<p class="text-sm text-[--text-muted] mb-2">
							Connect an RSS feed to start pulling in content.
						</p>
						<a href="/sources" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:scale-105 hover:shadow-md group/btn" style:background={colors.blueBg} style:color={colors.blue}>
							Go to Sources
							<svg class="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</a>
					</div>
				</li>
				<li class="flex items-start gap-3">
					<span class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5" style:background={colors.blue} style:color="#1a1b26">
						2
					</span>
					<div>
						<span class="font-medium text-[--text-primary] text-sm">Build your algorithm</span>
						<p class="text-sm text-[--text-muted] mb-2">
							Use the visual editor to combine and filter sources.
						</p>
						<a href="/algorithm" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:scale-105 hover:shadow-md group/btn" style:background={colors.purpleBg} style:color={colors.purple}>
							Open Editor
							<svg class="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</a>
					</div>
				</li>
				<li class="flex items-start gap-3">
					<span class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5" style:background={colors.blue} style:color="#1a1b26">
						3
					</span>
					<div>
						<span class="font-medium text-[--text-primary] text-sm">Enjoy your feed</span>
						<p class="text-sm text-[--text-muted] mb-2">
							View your personalized content and give feedback.
						</p>
						<a href="/feed" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:scale-105 hover:shadow-md group/btn" style:background={colors.cyanBg} style:color={colors.cyan}>
							View Feed
							<svg class="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
						</a>
					</div>
				</li>
			</ol>
		</div>
	{/if}
</div>
