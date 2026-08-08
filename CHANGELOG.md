# Changelog

## 1.7.1 (2026-08-08)

### Changed

- **Documented `pinterest.coverImageUrl` in the Platform Specific (JSON) help.** Cover image for Pinterest video pins — optional, since the server now falls back to an attached image, then the video's auto-extracted poster frame. Previously video pins could not carry a cover at all and always failed.

## 1.7.0 (2026-08-01)

### Added

- **Link Tracking on `Post -> Create` and `Post -> Update`.** Per-post override for bulkpubli.sh link tracking: "On" shortens the links in the post and counts their clicks, "Off" publishes them as written, and "Inherit Organization Setting" follows the org-level Link Tracking toggle. Update also offers "Leave Unchanged" (the default) — picking "Inherit" there sends an explicit `null` to *clear* a previously-set override, which omitting the field would not do.
- **Sort By / Sort Order on `Analytics -> Engagement`.** Sorts the `allPosts` breakdown by `date` (default), `impressions`, `likes`, `comments`, `shares` or `linkClicks`. Only sent for Engagement — the Summary endpoint has no such parameters.
- **`linkClicks` / `totalLinkClicks` documented on Engagement.** Clicks on bulkpubli.sh short links, measured by BulkPublish rather than reported by the platform, so they are available even for platforms that report no per-post metrics at all.

### Notes

`linkClicks` is deliberately **not** part of `totalClicks` — the platform's own click figure and ours can both register the same visit, so adding them double-counts. Shortening is skipped for any channel where the rewritten text would exceed that platform's character limit (a short URL is 28 characters and can be longer than the link it replaces); the post still publishes, with its original links, and `linkClicks` stays 0 for that channel.

## 1.6.0 (2026-07-28)

### Added

- **Per-metric platform support surfaced on Metrics and Engagement.** `Post -> Metrics` entries carry `metricsSupported` and `supportedMetrics`; `Analytics -> Engagement` adds `metricSupport`, `supportedTotals`, `partialTotals`, `conditionalMetrics` and `metricsDisabledChannels`. Both operations now describe the rule in the node UI, and the README gains a "Reading metrics safely" section with the full per-platform table.

### Fixed

- **A `0` was indistinguishable from "this platform has no such metric".** Every metric column is stored as an integer defaulting to 0, so a workflow branching on `clicks` for an X post saw a confident `0` forever — X has no clicks field. Branch on `supportedMetrics` / `supportedTotals` instead of the number.
- Server-side, three platforms were under-reporting: Pinterest pins always returned 0 likes and 0 comments, Threads posts returned no metrics at all, and Bluesky returned no saves. All three are fixed and start populating with no workflow changes.

## 1.5.0 (2026-07-24)

### Added

- **Post → Approve / Reject** — new operations for the team-approval flow. Approve (`POST /api/posts/{id}/approve`, no body) publishes immediately if the post's `scheduledAt` has already passed; Reject (`POST /api/posts/{id}/reject`) takes an optional **Reason** (max 2000 chars) and returns the post to draft with the reason. Both require a role with `post:approve` (owner/admin/approver) and return 400 if the post isn't pending.
- **Post → Create/Update: Request Approval** boolean (default false) — holds a scheduled post as pending team approval; the scheduler skips pending/rejected posts. The server forces this on for API keys of roles without `post:publish` (contributors).
- **Post → List: Approval Status** filter (`none` / `pending` / `approved` / `rejected`). Post objects now include `approvalStatus`, `approvedBy`, `approvedAt`, and `rejectionReason` (returned as-is, orthogonal to post status).
- Note: Publish and Retry now return 403 `APPROVAL_REQUIRED` for roles without `post:publish`.

## 1.4.1 (2026-07-18)

### Changed

- **RSS Feed field-mapping help text**: Documented that a feed item's own extra leaf fields (namespaced or not) can be used as `{fieldName}` caption tokens in addition to the standard set — the webapp editor surfaces a feed's real fields as pills after a preview. Docs/prose only; the `template` string is forwarded unchanged.

## 1.4.0 (2026-07-18)

### Added

- **RSS Feed: Field Mapping (JSON)** on Create and Update — the new `fieldMapping` API field controlling how each feed item becomes a post: caption `template` (tokens `{title} {link} {description} {content} {author} {categories} {feedName}`), `mediaField` (`none` default / `image` / `video` / `auto`; the enclosure is re-hosted to the media library and media-required platforms are skipped for items without a usable one), `stripHtml` (default true), `truncate` (`smart` default / `hard` / `skip`), `hashtags`, and per-channel text `channelOverrides` keyed by channel ID. On Update, pass the literal JSON `null` to clear the mapping back to the server default; leave empty to keep current.

## 1.3.0 (2026-07-17)

### Added

- **New resource: Channel Set** — Create / List / Update / Delete saved channel groups (`/api/channel-sets`). Max 50 sets per organization; names are unique per org (duplicates return 409 `DUPLICATE_NAME`). Update requires at least one of name/channel IDs.
- **New resource: RSS Feed** — Create / List / Update / Delete RSS autopost feeds (`/api/rss-feeds`). Feeds are polled every 15 minutes; new items become posts. `mode` defaults to **draft** (items land as draft posts for review) — set publish to auto-publish. Max 20 feeds per organization. Changing a feed's URL re-baselines it: only items newer than the change are posted.
- **Media → Upload Large File** — chunked multipart upload (`/api/media/multipart/create|complete|abort`) for videos up to 1GB and images up to 100MB. Files are sent in 10MB parts; on any failure the upload is aborted server-side so stored parts are freed. Note: n8n buffers the whole binary in memory before upload.

## 1.2.0 (2026-07-16)

### Fixed

- **Schedule → Create/Update rewritten to the API's real model.** The node sent `cronExpression` + `content`, but the BulkPublish API uses `frequency` (daily/weekly/biweekly/monthly), `timeOfDay` (HH:MM), `dayOfWeek`/`dayOfMonth`, and `contentTemplate`. Schedule creation previously failed with a 400 every time; updates silently ignored the content/cron changes. New fields: **Frequency**, **Time of Day**, **Day of Week** (weekly/biweekly), **Day of Month** (monthly).
- **Post → Queue Slot** now takes a **Timezone** instead of a Channel ID. The queue slot is organization-wide; the API ignored the channel ID that the node was sending.
- **Post → Create** now sends label IDs under `labels` (the field the API reads). Labels were silently dropped before.

### Added

- **Post → Bulk Operations** gained the **Reschedule** action (with a Scheduled At field) alongside Delete and Retry.
- Reddit, Discord, and Telegram documented as supported platforms (14 total).
- **Post → List** status filter now includes Publishing, Processing, and Partial.

## 1.1.3 (2026-05-21)

### Changed

- Removed the stale "LinkedIn organizations" reference from the **Get Options** action. LinkedIn company pages are now connected in the BulkPublish dashboard (OAuth), so Get Options returns only Pinterest boards and YouTube playlists. Listing and posting to connected LinkedIn personal profiles and company pages works unchanged.
