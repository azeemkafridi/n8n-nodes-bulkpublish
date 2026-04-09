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

      // Post: Get/Update/Delete/Publish/Retry — ID
      {
        displayName: 'Post ID',
        name: 'postId',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: { show: { resource: ['post'], operation: ['get', 'update', 'delete', 'publish', 'retry'] } },
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
        ],
        default: 'list',
      },
      {
        displayName: 'Channel ID',
        name: 'channelId',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: { show: { resource: ['channel'], operation: ['get', 'health', 'options'] } },
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
        displayOptions: { show: { resource: ['media'], operation: ['delete'] } },
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
        displayOptions: { show: { resource: ['label'], operation: ['delete'] } },
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
          { name: 'List', value: 'list', action: 'List recurring schedules' },
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
        displayOptions: { show: { resource: ['schedule'], operation: ['delete'] } },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

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

          responseData = await this.helpers.httpRequest({
            method: 'POST', url: `${BASE_URL}/api/posts`, body, json: true,
          });
        } else if (operation === 'get') {
          const id = this.getNodeParameter('postId', i) as number;
          responseData = await this.helpers.httpRequest({
            method: 'GET', url: `${BASE_URL}/api/posts/${id}`, json: true,
          });
        } else if (operation === 'list') {
          const qs: any = { limit: this.getNodeParameter('limit', i) };
          const status = this.getNodeParameter('statusFilter', i, '') as string;
          if (status) qs.status = status;
          responseData = await this.helpers.httpRequest({
            method: 'GET', url: `${BASE_URL}/api/posts`, qs, json: true,
          });
        } else if (operation === 'update') {
          const id = this.getNodeParameter('postId', i) as number;
          const body: any = {};
          const content = this.getNodeParameter('updateContent', i, '') as string;
          if (content) body.content = content;
          responseData = await this.helpers.httpRequest({
            method: 'PUT', url: `${BASE_URL}/api/posts/${id}`, body, json: true,
          });
        } else if (operation === 'delete') {
          const id = this.getNodeParameter('postId', i) as number;
          responseData = await this.helpers.httpRequest({
            method: 'DELETE', url: `${BASE_URL}/api/posts/${id}`, json: true,
          });
        } else if (operation === 'publish') {
          const id = this.getNodeParameter('postId', i) as number;
          responseData = await this.helpers.httpRequest({
            method: 'POST', url: `${BASE_URL}/api/posts/${id}/publish`, json: true,
          });
        } else if (operation === 'retry') {
          const id = this.getNodeParameter('postId', i) as number;
          responseData = await this.helpers.httpRequest({
            method: 'POST', url: `${BASE_URL}/api/posts/${id}/retry`, json: true,
          });
        }
      }

      // ── Channels ───────────────────────────────────────────
      else if (resource === 'channel') {
        if (operation === 'list') {
          responseData = await this.helpers.httpRequest({
            method: 'GET', url: `${BASE_URL}/api/channels`, json: true,
          });
        } else if (operation === 'get') {
          const id = this.getNodeParameter('channelId', i) as number;
          responseData = await this.helpers.httpRequest({
            method: 'GET', url: `${BASE_URL}/api/channels/${id}`, json: true,
          });
        } else if (operation === 'health') {
          const id = this.getNodeParameter('channelId', i) as number;
          responseData = await this.helpers.httpRequest({
            method: 'GET', url: `${BASE_URL}/api/channels/${id}/health`, json: true,
          });
        } else if (operation === 'options') {
          const id = this.getNodeParameter('channelId', i) as number;
          responseData = await this.helpers.httpRequest({
            method: 'GET', url: `${BASE_URL}/api/channels/${id}/options`, json: true,
          });
        }
      }

      // ── Media ──────────────────────────────────────────────
      else if (resource === 'media') {
        if (operation === 'upload') {
          const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
          const binaryData = this.helpers.assertBinaryData(i, binaryProperty);
          const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);
          responseData = await this.helpers.httpRequest({
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
          responseData = await this.helpers.httpRequest({
            method: 'GET', url: `${BASE_URL}/api/media`, json: true,
          });
        } else if (operation === 'delete') {
          const id = this.getNodeParameter('mediaId', i) as number;
          responseData = await this.helpers.httpRequest({
            method: 'DELETE', url: `${BASE_URL}/api/media/${id}`, json: true,
          });
        }
      }

      // ── Labels ─────────────────────────────────────────────
      else if (resource === 'label') {
        if (operation === 'create') {
          responseData = await this.helpers.httpRequest({
            method: 'POST', url: `${BASE_URL}/api/labels`, json: true,
            body: {
              name: this.getNodeParameter('labelName', i) as string,
              color: this.getNodeParameter('labelColor', i) as string,
            },
          });
        } else if (operation === 'list') {
          responseData = await this.helpers.httpRequest({
            method: 'GET', url: `${BASE_URL}/api/labels`, json: true,
          });
        } else if (operation === 'delete') {
          const id = this.getNodeParameter('labelId', i) as number;
          responseData = await this.helpers.httpRequest({
            method: 'DELETE', url: `${BASE_URL}/api/labels/${id}`, json: true,
          });
        }
      }

      // ── Analytics ──────────────────────────────────────────
      else if (resource === 'analytics') {
        const from = this.getNodeParameter('from', i) as string;
        const to = this.getNodeParameter('to', i) as string;
        const endpoint = operation === 'engagement' ? 'engagement' : 'summary';
        responseData = await this.helpers.httpRequest({
          method: 'GET', url: `${BASE_URL}/api/analytics/${endpoint}`,
          qs: { from, to }, json: true,
        });
      }

      // ── Schedules ──────────────────────────────────────────
      else if (resource === 'schedule') {
        if (operation === 'list') {
          responseData = await this.helpers.httpRequest({
            method: 'GET', url: `${BASE_URL}/api/schedules`, json: true,
          });
        } else if (operation === 'delete') {
          const id = this.getNodeParameter('scheduleId', i) as number;
          responseData = await this.helpers.httpRequest({
            method: 'DELETE', url: `${BASE_URL}/api/schedules/${id}`, json: true,
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
