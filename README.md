# I'm Bored

A personalized content aggregation app where you control the algorithm. Content flows through a DAG (Directed Acyclic Graph) of Sources and Transforms that you configure and visualize.

## Tech Stack

- **Frontend**: SvelteKit 2.50, Svelte 5, TypeScript
- **Styling**: Tailwind CSS 4
- **DAG Visualization**: @xyflow/svelte (Svelte Flow)
- **State Management**: Svelte 5 runes with context-based stores

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npm run check

# Build for production
npm run build
```

## Project Structure

```
src/
├── lib/
│   ├── types/           # TypeScript type definitions
│   │   ├── core.ts      # ContentItem, Feedback, enums
│   │   ├── streams.ts   # Source, Transform, configs
│   │   └── dag.ts       # DAG node/edge types
│   │
│   ├── stores/          # Svelte 5 rune-based stores
│   │   ├── streams.svelte.ts
│   │   ├── content.svelte.ts
│   │   └── feedback.svelte.ts
│   │
│   ├── dag/             # DAG utilities
│   │   ├── builder.ts   # DAG construction & validation
│   │   └── layout.ts    # Auto-layout algorithm
│   │
│   ├── api/
│   │   └── client.ts    # Mock API client
│   │
│   └── components/
│       ├── dag/         # DAG visualization
│       ├── content/     # Feed components
│       ├── feedback/    # Feedback UI
│       └── ui/          # Base components
│
└── routes/
    ├── +layout.svelte   # Root layout
    ├── +page.svelte     # Dashboard
    ├── feed/            # Content feed
    ├── algorithm/       # DAG editor
    └── sources/         # Source management
```

## Core Concepts

### Streams
- **Source**: Fetches content from external services (RSS, YouTube, Todoist)
- **Transform**: Operations applied to streams (Mixer, Filter, Sorter, Limiter)

### DAG Flow
Content flows left-to-right through the DAG:
1. Sources on the left fetch raw content
2. Transforms in the middle process/combine content
3. Output on the right delivers your personalized feed

---

## TODO

### Phase 1: Backend Integration
- [ ] Create Python backend service for content fetching
- [ ] Implement real RSS feed parsing
- [ ] Add DAG execution engine on backend
- [ ] Set up REST API endpoints:
  - [ ] `GET /api/sources` - List sources
  - [ ] `POST /api/sources` - Create source
  - [ ] `DELETE /api/sources/:id` - Delete source
  - [ ] `GET /api/streams/:id/content` - Get content for stream
  - [ ] `POST /api/feedback` - Submit feedback
  - [ ] `GET /api/transforms/types` - Get available transform types

### Phase 2: Additional Sources
- [ ] YouTube source implementation
  - [ ] OAuth flow for YouTube API
  - [ ] Channel subscription support
  - [ ] Playlist support
  - [ ] Search query support
- [ ] Todoist source implementation
  - [ ] OAuth flow for Todoist API
  - [ ] Project filtering
  - [ ] Label filtering

### Phase 3: LLM Transforms
- [ ] Implement LLM transform execution on backend
- [ ] AI Summarizer transform
  - [ ] Configurable summary length
  - [ ] Multiple summary styles (brief, detailed, bullet points)
- [ ] AI Tagger transform
  - [ ] Custom category support
  - [ ] Auto-generated tags
- [ ] AI Relevance Scorer transform
  - [ ] User interest configuration
  - [ ] Threshold filtering
- [ ] AI Semantic Filter transform
  - [ ] Natural language filter criteria
  - [ ] Include/exclude modes

### Phase 4: Persistence
- [ ] Add database for storing:
  - [ ] User configurations (sources, DAG)
  - [ ] Content cache
  - [ ] Feedback history
- [ ] Implement user authentication
- [ ] Add multi-user support

### Phase 5: Enhanced Features
- [ ] Infinite scroll on feed page
- [ ] Content search within feed
- [ ] Keyboard shortcuts
- [ ] Dark/light theme toggle
- [ ] Export/import DAG configurations
- [ ] Content bookmarking
- [ ] Read/unread tracking
- [ ] Notification system for new content

### Phase 6: Transform Enhancements
- [ ] Filter transform UI for rule builder
- [ ] Sorter transform with multiple sort keys
- [ ] Weighted mixer configuration UI
- [ ] Transform preview (show sample output)
- [ ] Transform templates/presets

### Phase 7: Analytics & Learning
- [ ] Feedback analytics dashboard
- [ ] Content consumption patterns
- [ ] Source quality metrics
- [ ] Auto-tune transforms based on feedback
- [ ] Recommendation engine for new sources

### Bug Fixes & Improvements
- [ ] Handle network errors gracefully
- [ ] Add loading states for all async operations
- [ ] Improve DAG validation error messages
- [ ] Add undo/redo for DAG edits
- [ ] Mobile responsive improvements
- [ ] Accessibility audit and fixes

### Testing
- [ ] Unit tests for DAG builder/validator
- [ ] Unit tests for stores
- [ ] Component tests
- [ ] E2E tests with Playwright
- [ ] API integration tests

### Documentation
- [ ] API documentation
- [ ] Component documentation
- [ ] User guide
- [ ] Contributing guidelines

---

## Architecture Notes

### Transform Registry Pattern
The architecture supports dynamic transform registration:
1. Backend maintains a registry of available transform types
2. Frontend fetches available transforms from `/api/transforms/types`
3. Each transform type has a JSON schema for its config
4. New transforms can be added to backend without frontend changes

### Async LLM Execution
LLM transforms are designed for async execution:
1. Content items are queued for LLM processing
2. Backend processes items and caches results
3. Frontend shows "processing" state for pending items
4. Processed items display LLM enrichments (summary, tags, scores)

### Extensible ContentItem
Content items support arbitrary enrichments:
```typescript
interface ContentItem {
  // ... base fields
  llmEnrichments?: {
    summary?: string;
    tags?: string[];
    relevanceScore?: number;
    [key: string]: unknown;  // Extensible
  };
}
```
