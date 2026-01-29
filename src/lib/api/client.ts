import type { StreamId, ContentItem, ContentItemId } from '$lib/types/core';
import { ContentType, createContentItemId } from '$lib/types/core';
import type { Stream, Source, RSSSourceConfig } from '$lib/types/streams';
import { SourceType } from '$lib/types/streams';

// Mock content data for development
const MOCK_RSS_ITEMS: Array<{
	title: string;
	description: string;
	url: string;
	author?: string;
	imageUrl?: string;
}> = [
	{
		title: 'Understanding Modern JavaScript Frameworks',
		description:
			'A deep dive into React, Vue, and Svelte - comparing their approaches to state management and reactivity.',
		url: 'https://example.com/js-frameworks',
		author: 'Jane Developer',
		imageUrl: 'https://picsum.photos/seed/js/400/200'
	},
	{
		title: 'The Rise of Edge Computing',
		description:
			'How edge computing is changing the way we think about web applications and reducing latency for users worldwide.',
		url: 'https://example.com/edge-computing',
		author: 'Tech Insights'
	},
	{
		title: 'Building Accessible Web Applications',
		description:
			'Best practices for creating web apps that work for everyone, including users who rely on assistive technologies.',
		url: 'https://example.com/accessibility',
		author: 'A11y Expert',
		imageUrl: 'https://picsum.photos/seed/a11y/400/200'
	},
	{
		title: 'Introduction to WebAssembly',
		description:
			'Learn how WebAssembly enables high-performance applications in the browser and opens up new possibilities for web development.',
		url: 'https://example.com/wasm',
		author: 'Binary Coder'
	},
	{
		title: 'CSS Container Queries: A Game Changer',
		description:
			'Container queries are finally here! Learn how they change the way we build responsive components.',
		url: 'https://example.com/container-queries',
		author: 'Style Master',
		imageUrl: 'https://picsum.photos/seed/css/400/200'
	},
	{
		title: 'The Future of AI in Software Development',
		description:
			'Exploring how AI tools are transforming the way developers write, test, and maintain code.',
		url: 'https://example.com/ai-dev',
		author: 'AI Weekly'
	},
	{
		title: 'Micro-Frontends Architecture',
		description:
			'Breaking down monolithic frontends into smaller, independently deployable pieces for better scalability.',
		url: 'https://example.com/micro-frontends',
		author: 'Architecture Today',
		imageUrl: 'https://picsum.photos/seed/arch/400/200'
	},
	{
		title: 'TypeScript 5.0 New Features',
		description:
			'A comprehensive overview of the latest TypeScript features and how they improve developer experience.',
		url: 'https://example.com/ts5',
		author: 'Type Safe'
	},
	{
		title: 'Optimizing React Performance',
		description:
			'Tips and tricks for making your React applications faster, from memoization to lazy loading.',
		url: 'https://example.com/react-perf',
		author: 'React Weekly',
		imageUrl: 'https://picsum.photos/seed/react/400/200'
	},
	{
		title: 'Introduction to Deno 2.0',
		description:
			'Exploring the latest version of Deno and its improved Node.js compatibility.',
		url: 'https://example.com/deno',
		author: 'Runtime Review'
	}
];

const MOCK_TECH_NEWS: Array<{
	title: string;
	description: string;
	url: string;
	author?: string;
	imageUrl?: string;
}> = [
	{
		title: 'Major Tech Company Announces New AI Product',
		description:
			'The latest AI assistant promises to revolutionize how we interact with technology in our daily lives.',
		url: 'https://technews.example.com/ai-product',
		author: 'Tech Reporter'
	},
	{
		title: 'Open Source Project Reaches 100k Stars',
		description:
			'A popular developer tool achieves a major milestone, reflecting its impact on the community.',
		url: 'https://technews.example.com/oss-milestone',
		author: 'OSS Daily',
		imageUrl: 'https://picsum.photos/seed/stars/400/200'
	},
	{
		title: 'New Privacy Regulations Take Effect',
		description:
			'How the latest data protection laws will affect tech companies and users alike.',
		url: 'https://technews.example.com/privacy-laws',
		author: 'Policy Watch'
	},
	{
		title: 'Startup Secures $50M in Funding',
		description:
			'A promising developer tools startup raises significant funding to expand its platform.',
		url: 'https://technews.example.com/startup-funding',
		author: 'Venture Beat',
		imageUrl: 'https://picsum.photos/seed/funding/400/200'
	},
	{
		title: 'Major Security Vulnerability Discovered',
		description:
			'Researchers find a critical flaw affecting millions of devices. Here is what you need to know.',
		url: 'https://technews.example.com/security-vuln',
		author: 'Security Week'
	}
];

// Simulate network delay
function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generate mock content items for a source
function generateMockItems(
	sourceId: StreamId,
	sourceConfig: RSSSourceConfig,
	mockData: typeof MOCK_RSS_ITEMS
): ContentItem[] {
	const maxItems = sourceConfig.maxItems ?? 10;
	const items = mockData.slice(0, maxItems);

	return items.map((item, index) => {
		const publishedAt = new Date();
		publishedAt.setHours(publishedAt.getHours() - index * 2); // Stagger publish times

		return {
			id: createContentItemId(),
			sourceStreamId: sourceId,
			type: ContentType.Article,
			title: item.title,
			description: item.description,
			url: item.url,
			author: item.author,
			imageUrl: item.imageUrl,
			publishedAt,
			fetchedAt: new Date()
		};
	});
}

// Mock API client
export const api = {
	// Fetch content for a source
	async fetchSourceContent(source: Source): Promise<ContentItem[]> {
		await delay(500 + Math.random() * 500); // Simulate network delay

		if (source.config.type === SourceType.RSS) {
			// Use different mock data based on feed URL
			const feedUrl = source.config.feedUrl.toLowerCase();
			if (feedUrl.includes('tech') || feedUrl.includes('news')) {
				return generateMockItems(source.id, source.config, MOCK_TECH_NEWS);
			}
			return generateMockItems(source.id, source.config, MOCK_RSS_ITEMS);
		}

		// Other source types return empty for now
		return [];
	},

	// Fetch content for multiple sources
	async fetchAllSourceContent(sources: Source[]): Promise<Map<StreamId, ContentItem[]>> {
		const results = new Map<StreamId, ContentItem[]>();

		const promises = sources.map(async (source) => {
			const items = await api.fetchSourceContent(source);
			return { sourceId: source.id, items };
		});

		const settled = await Promise.all(promises);
		for (const { sourceId, items } of settled) {
			results.set(sourceId, items);
		}

		return results;
	},

	// Validate an RSS feed URL (mock)
	async validateRSSUrl(url: string): Promise<{ valid: boolean; title?: string; error?: string }> {
		await delay(300);

		// Basic URL validation
		try {
			new URL(url);
		} catch {
			return { valid: false, error: 'Invalid URL format' };
		}

		// Simulate some URLs being invalid
		if (url.includes('invalid') || url.includes('error')) {
			return { valid: false, error: 'Could not fetch RSS feed' };
		}

		return { valid: true, title: 'Mock RSS Feed' };
	},

	// Get available transform types (for extensibility)
	async getTransformTypes(): Promise<
		Array<{
			type: string;
			name: string;
			description: string;
			isLLM: boolean;
			configSchema: Record<string, unknown>;
		}>
	> {
		await delay(100);

		return [
			{
				type: 'mixer',
				name: 'Mixer',
				description: 'Combine multiple streams into one',
				isLLM: false,
				configSchema: {
					strategy: { type: 'string', enum: ['interleave', 'weighted', 'round_robin'] }
				}
			},
			{
				type: 'filter',
				name: 'Filter',
				description: 'Remove items based on rules',
				isLLM: false,
				configSchema: {
					mode: { type: 'string', enum: ['include', 'exclude'] },
					rules: { type: 'array' }
				}
			},
			{
				type: 'sorter',
				name: 'Sorter',
				description: 'Reorder items by a field',
				isLLM: false,
				configSchema: {
					sortBy: { type: 'string', enum: ['publishedAt', 'fetchedAt', 'title', 'relevanceScore'] },
					order: { type: 'string', enum: ['asc', 'desc'] }
				}
			},
			{
				type: 'limiter',
				name: 'Limiter',
				description: 'Cap the number of items',
				isLLM: false,
				configSchema: {
					maxItems: { type: 'number', minimum: 1 }
				}
			},
			{
				type: 'llm_summarizer',
				name: 'AI Summarizer',
				description: 'Generate summaries using AI',
				isLLM: true,
				configSchema: {
					model: { type: 'string' },
					maxLength: { type: 'number' },
					style: { type: 'string', enum: ['brief', 'detailed', 'bullet_points'] }
				}
			},
			{
				type: 'llm_tagger',
				name: 'AI Tagger',
				description: 'Auto-categorize content with AI',
				isLLM: true,
				configSchema: {
					model: { type: 'string' },
					categories: { type: 'array' },
					maxTags: { type: 'number' }
				}
			}
		];
	},

	// Submit feedback (mock)
	async submitFeedback(feedback: {
		contentItemId: ContentItemId;
		sentiment: string;
		reasons?: string[];
		comment?: string;
	}): Promise<{ success: boolean }> {
		await delay(200);
		console.log('Feedback submitted:', feedback);
		return { success: true };
	}
};
