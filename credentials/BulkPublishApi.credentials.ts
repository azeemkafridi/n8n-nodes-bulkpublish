import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class BulkPublishApi implements ICredentialType {
  name = 'bulkPublishApi';
  displayName = 'BulkPublish API';
  documentationUrl = 'https://github.com/azeemkafridi/bulkpublish-api';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your BulkPublish API key (starts with bp_). Get one at https://app.bulkpublish.com/settings/developer',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://app.bulkpublish.com',
      url: '/api/channels',
      method: 'GET',
    },
  };
}
