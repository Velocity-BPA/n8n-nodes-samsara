/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class SamsaraApi implements ICredentialType {
  name = 'samsaraApi';
  displayName = 'Samsara API';
  documentationUrl = 'https://developers.samsara.com/docs/authentication';

  properties: INodeProperties[] = [
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description:
        'The API token from your Samsara Dashboard. Navigate to Settings > API Tokens to create one.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiToken}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://api.samsara.com',
      url: '/fleet/vehicles',
      method: 'GET',
      qs: {
        limit: 1,
      },
    },
  };
}
