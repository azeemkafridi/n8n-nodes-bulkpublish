import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

const BASE_URL = 'https://app.bulkpublish.com';

export class BulkPublish implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'BulkPublish',
    name: 'bulkPublish',
    icon: 'file:icon.svg',
    group: ['output'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Publish to 11 social media platforms — Facebook, Instagram, X, TikTok, YouTube, Threads, Bluesky, Pinterest, LinkedIn, Mastodon, Google Business Profile',
    defaults: { name: 'BulkPublish' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'bulkPublishApi', required: true }],
    properties: [
      // ── Resource ─────────────────────────────────────────────
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Post', value: 'post' },
          { name: 'Channel', value: 'channel' },
          { name: 'Media', value: 'media' },
          { name: 'Label', value: 'label' },
          { name: 'Analytics', value: 'analytics' },
          { name: 'Schedule', value: 'schedule' },
          { name: 'Quota', value: 'quota' },
        ],
        default: 'post',
      },

      // ── Post Operations ──────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['post'] } },
        options: [
          { name: 'Create', value: 'create', action: 'Create a post' },
          { name: 'Get', value: 'get', action: 'Get a post' },
          { name: 'List', value: 'list', action: 'List posts' },
          { name: 'Update', value: 'update', action: 'Update a post' },
          { name: 'Delete', value: 'delete', action: 'Delete a post' },
          { name: 'Publish', value: 'publish', action: 'Publish a draft immediately' },
          { name: 'Retry', value: 'retry', action: 'Retry failed platforms' },
          { name: 'Metrics', value: 'metrics', action: 'Get post metrics' },
          { name: 'Story Publish', value: 'storyPublish', action: 'Publish a story' },
          { name: 'Bulk Operations', value: 'bulk', action: 'Bulk delete or retry posts' },
          { name: 'Queue Slot', value: 'queueSlot', action: 'Get next queue slot for a channel' },
        ],
        default: 'create',
      },

      // Post: Create fields
      {
        displayName: 'Content',
        name: 'content',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        required: true,
        displayOptions: { show: { resource: ['post'], operation: ['create'] } },
        description: 'The post text content',
      },
      {
        displayName: 'Channels (JSON)',
        name: 'channels',
        type: 'string',
        default: '[{"channelId": 1, "platform": "facebook"}]',
        required: true,
        displayOptions: { show: { resource: ['post'], operation: ['create'] } },
        description: 'JSON array of channels: [{"channelId": number, "platform": string}]. Get IDs from the Channel > List operation.',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Draft', value: 'draft' },
          { name: 'Scheduled', value: 'scheduled' },
        ],
        default: 'draft',
        displayOptions: { show: { resource: ['post'], operation: ['create'] } },
      },
      {
        displayName: 'Scheduled At',
        name: 'scheduledAt',
        type: 'dateTime',
        default: '',
        displayOptions: { show: { resource: ['post'], operation: ['create'], status: ['scheduled'] } },
        description: 'When to publish (ISO 8601)',
      },
      {
        displayName: 'Timezone',
        name: 'timezone',
        type: 'string',
        default: 'UTC',
        displayOptions: { show: { resource: ['post'], operation: ['create'], status: ['scheduled'] } },
        description: 'IANA timezone (e.g. America/New_York)',
      },
      {
        displayName: 'Media File IDs',
        name: 'mediaFiles',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['post'], operation: ['create'] } },
        description: 'Comma-separated media file IDs (from Media > Upload)',
      },
      {
        displayName: 'Label IDs',
        name: 'labelIds',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['post'], operation: ['create'] } },
        description: 'Comma-separated label IDs',
      },
      {
        displayName: 'Platform Content (JSON)',
        name: 'platformContent',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['post'], operation: ['create'] } },
        description: 'Per-platform text overrides: {"x": "Short", "linkedin": "Long version"}',
      },
      {
        displayName: 'Post Format',
        name: 'postFormat',
        type: 'options',
        options: [
          { name: 'Post', value: 'post' },
          { name: 'Thread', value: 'thread' },
        ],
        default: 'post',
        displayOptions: { show: { resource: ['post'], operation: ['create'] } },
        description: 'Post format. Use "thread" for multi-part thread posts on X, Threads, Bluesky, Mastodon.',
      },
      {
        displayName: 'Post Type Overrides (JSON)',
        name: 'postTypeOverrides',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['post'], operation: ['create'] } },
        description: 'Per-platform post type: {"instagram": "reel", "facebook": "story", "youtube": "short"}. Instagram: feed_photo, feed_video, reel, story, carousel. Facebook: post, reel, story. TikTok: video, photo_slideshow. YouTube: video, short.',
      },
      {
        displayName: 'Platform Specific (JSON)',
        name: 'platformSpecific',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['post'], operation: ['create'] } },
        description: 'Platform-specific options: {"tiktok": {"privacyLevel": "PUBLIC_TO_EVERYONE"}, "instagram": {"collaborators": ["@user"]}}',
      },
      {
        displayName: 'Thread Parts (JSON)',
        name: 'threadParts',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['post'], operation: ['create'] } },
        description: 'Thread parts array: [{"content": "Part 1"}, {"content": "Part 2"}]. Required when Post Format is "thread".',
      },

      // Post: Get/Update/Delete/Publish/Retry — ID
      {
        displayName: 'Post ID',
        name: 'postId',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: { show: { resource: ['post'], operation: ['get', 'update', 'delete', 'publish', 'retry', 'metrics', 'storyPublish'] } },
      },

      // Post: Update fields
      {
        displayName: 'Content',
        name: 'updateContent',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        displayOptions: { show: { resource: ['post'], operation: ['update'] } },
        description: 'New post content (leave empty to keep current)',
      },

      // Post: List filters
      {
        displayName: 'Status Filter',
        name: 'statusFilter',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          { name: 'Draft', value: 'draft' },
          { name: 'Scheduled', value: 'scheduled' },
          { name: 'Published', value: 'published' },
          { name: 'Failed', value: 'failed' },
        ],
        default: '',
        displayOptions: { show: { resource: ['post'], operation: ['list'] } },
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 20,
        displayOptions: { show: { resource: ['post'], operation: ['list'] } },
      },

      // Post: Story Publish fields
      {
        displayName: 'Story Platform',
        name: 'storyPlatform',
        type: 'options',
        options: [
          { name: 'Facebook', value: 'facebook' },
          { name: 'Instagram', value: 'instagram' },
        ],
        default: 'instagram',
        required: true,
        displayOptions: { show: { resource: ['post'], operation: ['storyPublish'] } },
        description: 'Platform to publish the story on',
      },

      // Post: Bulk Operations fields
      {
        displayName: 'Bulk Action',
        name: 'bulkAction',
        type: 'options',
        options: [
          { name: 'Delete', value: 'delete' },
          { name: 'Retry', value: 'retry' },
        ],
        default: 'delete',
        required: true,
        displayOptions: { show: { resource: ['post'], operation: ['bulk'] } },
        description: 'Action to perform on selected posts',
      },
      {
        displayName: 'Post IDs',
        name: 'bulkPostIds',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['post'], operation: ['bulk'] } },
        description: 'Comma-separated post IDs to act on',
      },

      // Post: Queue Slot fields
      {
        displayName: 'Channel ID',
        name: 'queueChannelId',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: { show: { resource: ['post'], operation: ['queueSlot'] } },
        description: 'Channel ID to get the next queue slot for',
      },

      // ── Channel Operations ───────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['channel'] } },
        options: [
          { name: 'List', value: 'list', action: 'List channels' },
          { name: 'Get', value: 'get', action: 'Get a channel' },
          { name: 'Health Check', value: 'health', action: 'Check channel health' },
          { name: 'Get Options', value: 'options', action: 'Get platform options (boards, playlists, orgs)' },
          { name: 'Mentions Search', value: 'mentions', action: 'Search mentions for a channel' },
        ],
        default: 'list',
      },
      {
        displayName: 'Channel ID',
        name: 'channelId',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: { show: { resource: ['channel'], operation: ['get', 'health', 'options', 'mentions'] } },
      },
      {
        displayName: 'Search Query',
        name: 'mentionQuery',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['channel'], operation: ['mentions'] } },
        description: 'Search query for mentions',
      },

      // ── Media Operations ─────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['media'] } },
        options: [
          { name: 'Upload', value: 'upload', action: 'Upload a media file' },
          { name: 'List', value: 'list', action: 'List media files' },
          { name: 'Get', value: 'get', action: 'Get a media file' },
          { name: 'Delete', value: 'delete', action: 'Delete a media file' },
        ],
        default: 'upload',
      },
      {
        displayName: 'Binary Property',
        name: 'binaryProperty',
        type: 'string',
        default: 'data',
        required: true,
        displayOptions: { show: { resource: ['media'], operation: ['upload'] } },
        description: 'Name of the binary property containing the file to upload',
      },
      {
        displayName: 'Media ID',
        name: 'mediaId',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: { show: { resource: ['media'], operation: ['get', 'delete'] } },
      },

      // ── Label Operations ─────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['label'] } },
        options: [
          { name: 'Create', value: 'create', action: 'Create a label' },
          { name: 'List', value: 'list', action: 'List labels' },
          { name: 'Update', value: 'update', action: 'Update a label' },
          { name: 'Delete', value: 'delete', action: 'Delete a label' },
        ],
        default: 'list',
      },
      {
        displayName: 'Label Name',
        name: 'labelName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['label'], operation: ['create'] } },
      },
      {
        displayName: 'Label Color',
        name: 'labelColor',
        type: 'string',
        default: '#6366f1',
        displayOptions: { show: { resource: ['label'], operation: ['create'] } },
        description: 'Hex color code',
      },
      {
        displayName: 'Label ID',
        name: 'labelId',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: { show: { resource: ['label'], operation: ['update', 'delete'] } },
      },
      {
        displayName: 'Label Name',
        name: 'updateLabelName',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['label'], operation: ['update'] } },
        description: 'New label name (leave empty to keep current)',
      },
      {
        displayName: 'Label Color',
        name: 'updateLabelColor',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['label'], operation: ['update'] } },
        description: 'New hex color code (leave empty to keep current)',
      },

      // ── Analytics Operations ─────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['analytics'] } },
        options: [
          { name: 'Summary', value: 'summary', action: 'Get analytics summary' },
          { name: 'Engagement', value: 'engagement', action: 'Get engagement data' },
        ],
        default: 'summary',
      },
      {
        displayName: 'From',
        name: 'from',
        type: 'dateTime',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['analytics'] } },
      },
      {
        displayName: 'To',
        name: 'to',
        type: 'dateTime',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['analytics'] } },
      },

      // ── Schedule Operations ──────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['schedule'] } },
        options: [
          { name: 'Create', value: 'create', action: 'Create a recurring schedule' },
          { name: 'List', value: 'list', action: 'List recurring schedules' },
          { name: 'Update', value: 'update', action: 'Update a schedule' },
          { name: 'Delete', value: 'delete', action: 'Delete a schedule' },
        ],
        default: 'list',
      },
      {
        displayName: 'Schedule ID',
        name: 'scheduleId',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: { show: { resource: ['schedule'], operation: ['update', 'delete'] } },
      },
      // Schedule: Create fields
      {
        displayName: 'Schedule Name',
        name: 'scheduleName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['schedule'], operation: ['create'] } },
      },
      {
        displayName: 'Channel IDs',
        name: 'scheduleChannelIds',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['schedule'], operation: ['create'] } },
        description: 'Comma-separated channel IDs for this schedule',
      },
      {
        displayName: 'Content',
        name: 'scheduleContent',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        required: true,
        displayOptions: { show: { resource: ['schedule'], operation: ['create'] } },
        description: 'Post content for the scheduled posts',
      },
      {
        displayName: 'Cron Expression',
        name: 'cronExpression',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['schedule'], operation: ['create'] } },
        description: 'Cron expression for the schedule (e.g. "0 9 * * 1" for every Monday at 9am)',
      },
      {
        displayName: 'Timezone',
        name: 'scheduleTimezone',
        type: 'string',
        default: 'UTC',
        displayOptions: { show: { resource: ['schedule'], operation: ['create'] } },
        description: 'IANA timezone (e.g. America/New_York)',
      },
      // Schedule: Update fields
      {
        displayName: 'Schedule Name',
        name: 'updateScheduleName',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['schedule'], operation: ['update'] } },
        description: 'New schedule name (leave empty to keep current)',
      },
      {
        displayName: 'Content',
        name: 'updateScheduleContent',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        displayOptions: { show: { resource: ['schedule'], operation: ['update'] } },
        description: 'New post content (leave empty to keep current)',
      },
      {
        displayName: 'Cron Expression',
        name: 'updateCronExpression',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['schedule'], operation: ['update'] } },
        description: 'New cron expression (leave empty to keep current)',
      },
      {
        displayName: 'Is Active',
        name: 'isActive',
        type: 'boolean',
        default: true,
        displayOptions: { show: { resource: ['schedule'], operation: ['update'] } },
        description: 'Whether the schedule is active',
      },

      // ── Quota Operations ─────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['quota'] } },
        options: [
          { name: 'Get Usage', value: 'usage', action: 'Get quota usage' },
        ],
        default: 'usage',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;
    const credName = 'bulkPublishApi';

    for (let i = 0; i < items.length; i++) {
      let responseData: any;

      // ── Posts ───────────────────────────────────────────────
      if (resource === 'post') {
        if (operation === 'create') {
          const channelsJson = this.getNodeParameter('channels', i) as string;
          const body: any = {
            content: this.getNodeParameter('content', i) as string,
            channels: JSON.parse(channelsJson),
            status: this.getNodeParameter('status', i) as string,
          };
          const scheduledAt = this.getNodeParameter('scheduledAt', i, '') as string;
          if (scheduledAt) body.scheduledAt = scheduledAt;
          const timezone = this.getNodeParameter('timezone', i, 'UTC') as string;
          if (timezone) body.timezone = timezone;
          const mediaStr = this.getNodeParameter('mediaFiles', i, '') as string;
          if (mediaStr) body.mediaFiles = mediaStr.split(',').map((s: string) => parseInt(s.trim(), 10)).filter(Boolean);
          const labelStr = this.getNodeParameter('labelIds', i, '') as string;
          if (labelStr) body.labelIds = labelStr.split(',').map((s: string) => parseInt(s.trim(), 10)).filter(Boolean);
          const pcStr = this.getNodeParameter('platformContent', i, '') as string;
          if (pcStr) body.platformContent = JSON.parse(pcStr);
          const postFormat = this.getNodeParameter('postFormat', i, 'post') as string;
          if (postFormat !== 'post') body.postFormat = postFormat;
          const postTypeOverrides = this.getNodeParameter('postTypeOverrides', i, '') as string;
          if (postTypeOverrides) try { body.postTypeOverrides = JSON.parse(postTypeOverrides); } catch {}
          const platformSpecific = this.getNodeParameter('platformSpecific', i, '') as string;
          if (platformSpecific) try { body.platformSpecific = JSON.parse(platformSpecific); } catch {}
          const threadPartsStr = this.getNodeParameter('threadParts', i, '') as string;
          if (threadPartsStr) try { body.threadParts = JSON.parse(threadPartsStr); } catch {}

          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'POST', url: `${BASE_URL}/api/posts`, body, json: true,
          });
        } else if (operation === 'get') {
          const id = this.getNodeParameter('postId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/posts/${id}`, json: true,
          });
        } else if (operation === 'list') {
          const qs: any = { limit: this.getNodeParameter('limit', i) };
          const status = this.getNodeParameter('statusFilter', i, '') as string;
          if (status) qs.status = status;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/posts`, qs, json: true,
          });
        } else if (operation === 'update') {
          const id = this.getNodeParameter('postId', i) as number;
          const body: any = {};
          const content = this.getNodeParameter('updateContent', i, '') as string;
          if (content) body.content = content;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'PUT', url: `${BASE_URL}/api/posts/${id}`, body, json: true,
          });
        } else if (operation === 'delete') {
          const id = this.getNodeParameter('postId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'DELETE', url: `${BASE_URL}/api/posts/${id}`, json: true,
          });
        } else if (operation === 'publish') {
          const id = this.getNodeParameter('postId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'POST', url: `${BASE_URL}/api/posts/${id}/publish`, json: true,
          });
        } else if (operation === 'retry') {
          const id = this.getNodeParameter('postId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'POST', url: `${BASE_URL}/api/posts/${id}/retry`, json: true,
          });
        } else if (operation === 'metrics') {
          const id = this.getNodeParameter('postId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/posts/${id}/metrics`, json: true,
          });
        } else if (operation === 'storyPublish') {
          const id = this.getNodeParameter('postId', i) as number;
          const platform = this.getNodeParameter('storyPlatform', i) as string;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'POST', url: `${BASE_URL}/api/posts/${id}/story`, json: true,
            body: { platform },
          });
        } else if (operation === 'bulk') {
          const action = this.getNodeParameter('bulkAction', i) as string;
          const idsStr = this.getNodeParameter('bulkPostIds', i) as string;
          const postIds = idsStr.split(',').map((s: string) => parseInt(s.trim(), 10)).filter(Boolean);
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'POST', url: `${BASE_URL}/api/posts/bulk`, json: true,
            body: { action, postIds },
          });
        } else if (operation === 'queueSlot') {
          const channelId = this.getNodeParameter('queueChannelId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/posts/queue-slot`, qs: { channelId }, json: true,
          });
        }
      }

      // ── Channels ───────────────────────────────────────────
      else if (resource === 'channel') {
        if (operation === 'list') {
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/channels`, json: true,
          });
        } else if (operation === 'get') {
          const id = this.getNodeParameter('channelId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/channels/${id}`, json: true,
          });
        } else if (operation === 'health') {
          const id = this.getNodeParameter('channelId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/channels/${id}/health`, json: true,
          });
        } else if (operation === 'options') {
          const id = this.getNodeParameter('channelId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/channels/${id}/options`, json: true,
          });
        } else if (operation === 'mentions') {
          const id = this.getNodeParameter('channelId', i) as number;
          const q = this.getNodeParameter('mentionQuery', i) as string;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/channels/${id}/mentions`, qs: { q }, json: true,
          });
        }
      }

      // ── Media ──────────────────────────────────────────────
      else if (resource === 'media') {
        if (operation === 'upload') {
          const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
          const binaryData = this.helpers.assertBinaryData(i, binaryProperty);
          const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'POST',
            url: `${BASE_URL}/api/media`,
            body: buffer,
            headers: {
              'Content-Type': binaryData.mimeType,
              'Content-Disposition': `attachment; filename="${binaryData.fileName || 'upload'}"`,
            },
            json: false,
          });
          if (typeof responseData === 'string') responseData = JSON.parse(responseData);
        } else if (operation === 'list') {
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/media`, json: true,
          });
        } else if (operation === 'get') {
          const id = this.getNodeParameter('mediaId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/media/${id}`, json: true,
          });
        } else if (operation === 'delete') {
          const id = this.getNodeParameter('mediaId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'DELETE', url: `${BASE_URL}/api/media/${id}`, json: true,
          });
        }
      }

      // ── Labels ─────────────────────────────────────────────
      else if (resource === 'label') {
        if (operation === 'create') {
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'POST', url: `${BASE_URL}/api/labels`, json: true,
            body: {
              name: this.getNodeParameter('labelName', i) as string,
              color: this.getNodeParameter('labelColor', i) as string,
            },
          });
        } else if (operation === 'list') {
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/labels`, json: true,
          });
        } else if (operation === 'update') {
          const id = this.getNodeParameter('labelId', i) as number;
          const body: any = {};
          const name = this.getNodeParameter('updateLabelName', i, '') as string;
          if (name) body.name = name;
          const color = this.getNodeParameter('updateLabelColor', i, '') as string;
          if (color) body.color = color;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'PUT', url: `${BASE_URL}/api/labels/${id}`, body, json: true,
          });
        } else if (operation === 'delete') {
          const id = this.getNodeParameter('labelId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'DELETE', url: `${BASE_URL}/api/labels/${id}`, json: true,
          });
        }
      }

      // ── Analytics ──────────────────────────────────────────
      else if (resource === 'analytics') {
        const from = this.getNodeParameter('from', i) as string;
        const to = this.getNodeParameter('to', i) as string;
        const endpoint = operation === 'engagement' ? 'engagement' : 'summary';
        responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
          method: 'GET', url: `${BASE_URL}/api/analytics/${endpoint}`,
          qs: { from, to }, json: true,
        });
      }

      // ── Schedules ──────────────────────────────────────────
      else if (resource === 'schedule') {
        if (operation === 'create') {
          const channelIdsStr = this.getNodeParameter('scheduleChannelIds', i) as string;
          const channelIds = channelIdsStr.split(',').map((s: string) => parseInt(s.trim(), 10)).filter(Boolean);
          const body: any = {
            name: this.getNodeParameter('scheduleName', i) as string,
            channelIds,
            content: this.getNodeParameter('scheduleContent', i) as string,
            cronExpression: this.getNodeParameter('cronExpression', i) as string,
            timezone: this.getNodeParameter('scheduleTimezone', i, 'UTC') as string,
          };
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'POST', url: `${BASE_URL}/api/schedules`, body, json: true,
          });
        } else if (operation === 'list') {
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/schedules`, json: true,
          });
        } else if (operation === 'update') {
          const id = this.getNodeParameter('scheduleId', i) as number;
          const body: any = {};
          const name = this.getNodeParameter('updateScheduleName', i, '') as string;
          if (name) body.name = name;
          const content = this.getNodeParameter('updateScheduleContent', i, '') as string;
          if (content) body.content = content;
          const cron = this.getNodeParameter('updateCronExpression', i, '') as string;
          if (cron) body.cronExpression = cron;
          body.isActive = this.getNodeParameter('isActive', i, true) as boolean;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'PUT', url: `${BASE_URL}/api/schedules/${id}`, body, json: true,
          });
        } else if (operation === 'delete') {
          const id = this.getNodeParameter('scheduleId', i) as number;
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'DELETE', url: `${BASE_URL}/api/schedules/${id}`, json: true,
          });
        }
      }

      // ── Quotas ─────────────────────────────────────────────
      else if (resource === 'quota') {
        if (operation === 'usage') {
          responseData = await this.helpers.httpRequestWithAuthentication.call(this, credName, {
            method: 'GET', url: `${BASE_URL}/api/quotas/usage`, json: true,
          });
        }
      }

      const items = Array.isArray(responseData) ? responseData : [responseData];
      for (const item of items) {
        returnData.push({ json: item });
      }
    }

    return [returnData];
  }
}
