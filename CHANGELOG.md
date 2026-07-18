# Changelog

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
