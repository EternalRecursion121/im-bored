<script lang="ts">
	import { getStreamsContext } from '$lib/stores/streams.svelte';
	import { getContentContext } from '$lib/stores/content.svelte';
	import { getFeedbackContext } from '$lib/stores/feedback.svelte';
	import { Button } from '$lib/components/ui';

	const streams = getStreamsContext();
	const content = getContentContext();
	const feedback = getFeedbackContext();

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
		<h1 class="text-2xl font-semibold text-zinc-100 mb-1">Dashboard</h1>
		<p class="text-zinc-500 text-sm">
			Your personalized content feed where you control the algorithm.
		</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
		<div class="bg-[#18181b] rounded-lg p-4 border border-zinc-800">
			<div class="w-8 h-8 bg-zinc-800 rounded-md flex items-center justify-center mb-3">
				<svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
				</svg>
			</div>
			<div class="text-2xl font-semibold text-zinc-100">{stats.sources}</div>
			<div class="text-xs text-zinc-500">Sources</div>
		</div>
		<div class="bg-[#18181b] rounded-lg p-4 border border-zinc-800">
			<div class="w-8 h-8 bg-zinc-800 rounded-md flex items-center justify-center mb-3">
				<svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</div>
			<div class="text-2xl font-semibold text-zinc-100">{stats.transforms}</div>
			<div class="text-xs text-zinc-500">Transforms</div>
		</div>
		<div class="bg-[#18181b] rounded-lg p-4 border border-zinc-800">
			<div class="w-8 h-8 bg-zinc-800 rounded-md flex items-center justify-center mb-3">
				<svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			</div>
			<div class="text-2xl font-semibold text-zinc-100">{stats.items}</div>
			<div class="text-xs text-zinc-500">Content Items</div>
		</div>
		<div class="bg-[#18181b] rounded-lg p-4 border border-zinc-800">
			<div class="w-8 h-8 bg-emerald-900/50 rounded-md flex items-center justify-center mb-3">
				<svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
				</svg>
			</div>
			<div class="text-2xl font-semibold text-emerald-400">{stats.likes}</div>
			<div class="text-xs text-zinc-500">Likes</div>
		</div>
		<div class="bg-[#18181b] rounded-lg p-4 border border-zinc-800">
			<div class="w-8 h-8 bg-red-900/50 rounded-md flex items-center justify-center mb-3">
				<svg class="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
				</svg>
			</div>
			<div class="text-2xl font-semibold text-red-400">{stats.dislikes}</div>
			<div class="text-xs text-zinc-500">Dislikes</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="grid md:grid-cols-3 gap-4 mb-8">
		<a
			href="/sources"
			class="bg-[#18181b] rounded-lg p-5 border border-zinc-800 hover:border-zinc-700 hover:bg-[#1f1f23] transition-all group"
		>
			<div class="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
				<svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
				</svg>
			</div>
			<h3 class="text-base font-medium text-zinc-100 mb-1">Add Sources</h3>
			<p class="text-zinc-500 text-sm">
				Connect RSS feeds, YouTube channels, or Todoist to bring in content.
			</p>
		</a>

		<a
			href="/algorithm"
			class="bg-[#18181b] rounded-lg p-5 border border-zinc-800 hover:border-zinc-700 hover:bg-[#1f1f23] transition-all group"
		>
			<div class="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
				<svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
				</svg>
			</div>
			<h3 class="text-base font-medium text-zinc-100 mb-1">Configure Algorithm</h3>
			<p class="text-zinc-500 text-sm">
				Design your content flow using a visual DAG editor. Mix, filter, and sort.
			</p>
		</a>

		<a
			href="/feed"
			class="bg-[#18181b] rounded-lg p-5 border border-zinc-800 hover:border-zinc-700 hover:bg-[#1f1f23] transition-all group"
		>
			<div class="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-4">
				<svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
				</svg>
			</div>
			<h3 class="text-base font-medium text-zinc-100 mb-1">View Feed</h3>
			<p class="text-zinc-500 text-sm">
				See your personalized content feed and provide feedback.
			</p>
		</a>
	</div>

	<!-- Getting Started Guide -->
	{#if stats.sources === 0}
		<div class="bg-blue-950/30 rounded-lg p-5 border border-blue-900/50">
			<h2 class="text-base font-medium text-blue-300 mb-4">Getting Started</h2>
			<ol class="space-y-3">
				<li class="flex items-start gap-3">
					<span class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
						1
					</span>
					<div>
						<span class="font-medium text-zinc-200 text-sm">Add your first source</span>
						<p class="text-sm text-zinc-400">
							Go to <a href="/sources" class="text-blue-400 hover:underline">Sources</a> and add an RSS feed URL.
						</p>
					</div>
				</li>
				<li class="flex items-start gap-3">
					<span class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
						2
					</span>
					<div>
						<span class="font-medium text-zinc-200 text-sm">Build your algorithm</span>
						<p class="text-sm text-zinc-400">
							Use the <a href="/algorithm" class="text-blue-400 hover:underline">Algorithm editor</a> to combine and filter sources.
						</p>
					</div>
				</li>
				<li class="flex items-start gap-3">
					<span class="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
						3
					</span>
					<div>
						<span class="font-medium text-zinc-200 text-sm">Enjoy your feed</span>
						<p class="text-sm text-zinc-400">
							View your personalized content on the <a href="/feed" class="text-blue-400 hover:underline">Feed page</a>.
						</p>
					</div>
				</li>
			</ol>
		</div>
	{/if}
</div>
