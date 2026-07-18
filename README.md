# n8n-nodes-bulkpublish

n8n community node for [BulkPublish](https://bulkpublish.com) — publish to 14 social media platforms from your n8n workflows.

## Supported Platforms

Facebook, Instagram, X (Twitter), TikTok, YouTube, Threads, Bluesky, Pinterest, Google Business Profile, LinkedIn, Mastodon

## Installation

In your n8n instance:

1. Go to **Settings > Community Nodes**
2. Enter `n8n-nodes-bulkpublish`
3. Click Install

Or via CLI:

```bash
npm install n8n-nodes-bulkpublish
```

## Credentials

1. Sign up at [app.bulkpublish.com](https://app.bulkpublish.com/register)
2. Go to **Settings > Developer** and create an API key
3. In n8n, add a **BulkPublish API** credential with your key

## Operations

### Post
- **Create** — Create a draft or scheduled post to one or more channels (supports all post types: reels, stories, carousels, threads via `postTypeOverrides`)
- **Get** — Get a post with platform statuses
- **List** — List posts with filters (status, search, date)
- **Update** — Update a draft or scheduled post
- **Delete** — Delete a post
- **Publish** — Publish a draft immediately
- **Retry** — Retry failed platforms
- **Metrics** — Get engagement metrics (impressions, likes, comments, shares)
- **Story Publish** — Publish as a story to Facebook or Instagram
- **Bulk Operations** — Bulk delete or retry multiple posts
- **Queue Slot** — Get the next optimal time slot for a channel

### Channel
- **List** — List all connected social media channels
- **Get** — Get a channel by ID
- **Health Check** — Check channel token health
- **Get Options** — Get platform-specific options (Pinterest boards, YouTube playlists)
- **Mentions Search** — Search users for @mention (X, Bluesky)

### Channel Set
- **Create** — Save a named group of channels for one-click targeting (max 50 sets per organization; names are unique — duplicates return a 409 `DUPLICATE_NAME` error)
- **List** — List channel sets
- **Update** — Rename a set or change its channels
- **Delete** — Delete a channel set

### Media
- **Upload** — Upload an image or video file
- **Upload Large File** — Chunked multipart upload for large files (videos up to 1GB, images up to 100MB). The file is sent in 10MB parts; each part is retried independently, so a network drop never restarts the whole file. Note: the whole file is buffered in n8n memory before upload — make sure your n8n instance has enough RAM for the file size.
- **Get** — Get a media file by ID
- **List** — List uploaded media files
- **Delete** — Delete a media file

### Label
- **Create** — Create a label
- **List** — List all labels
- **Update** — Update a label name or color
- **Delete** — Delete a label

### Analytics
- **Summary** — Get analytics summary for a date range
- **Engagement** — Get engagement data grouped by time period

### Schedule
- **List** — List recurring schedules
- **Create** — Create a recurring schedule (frequency + time of day)
- **Update** — Update a schedule
- **Delete** — Delete a schedule

### RSS Feed
- **Create** — Add an RSS/Atom feed for autoposting (polled every 15 min; new items become posts). `mode` defaults to `draft` (items land as drafts for review); set `publish` to auto-publish. Max 20 feeds per organization. Optional **Field Mapping (JSON)** controls how items render (caption template with item tokens, media selection, HTML stripping, truncation, hashtags, per-channel overrides).
- **List** — List RSS feeds (includes `lastCheckedAt` and `lastError`)
- **Update** — Change name, URL, channels, mode, or enabled. Changing the feed URL re-baselines the feed — only items newer than the change are posted.
- **Delete** — Delete an RSS feed

### Quota
- **Usage** — Get current plan limits and usage

## Example Workflows

### Auto-post RSS feed items
1. **RSS Feed Trigger** → reads new items
2. **BulkPublish** → creates a scheduled post for each item

### Post on GitHub release
1. **GitHub Trigger** → new release event
2. **BulkPublish** → creates and publishes announcement to all channels

## Links

- [API Docs](https://app.bulkpublish.com/docs)
- [SDK & Examples](https://github.com/azeemkafridi/bulkpublish-api)
- [npm](https://www.npmjs.com/package/bulkpublish)
- [PyPI](https://pypi.org/project/bulkpublish/)

## License

MIT
