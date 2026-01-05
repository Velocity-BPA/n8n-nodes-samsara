/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import {
  samsaraApiRequest,
  samsaraApiRequestAllItems,
  buildQueryString,
  formatTimeRange,
} from '../../transport';

export const assetOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['asset'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new asset',
        action: 'Create an asset',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get an asset by ID',
        action: 'Get an asset',
      },
      {
        name: 'Get Locations',
        value: 'getLocations',
        description: 'Get asset locations',
        action: 'Get asset locations',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many assets',
        action: 'Get many assets',
      },
      {
        name: 'Get Stats',
        value: 'getStats',
        description: 'Get asset statistics',
        action: 'Get asset stats',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an asset',
        action: 'Update an asset',
      },
    ],
    default: 'getAll',
  },
];

export const assetFields: INodeProperties[] = [
  // Asset ID for get, update operations
  {
    displayName: 'Asset ID',
    name: 'assetId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['asset'],
        operation: ['get', 'update'],
      },
    },
    description: 'The ID of the asset',
  },

  // Create asset fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['asset'],
        operation: ['create'],
      },
    },
    description: 'The name of the asset',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['asset'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Serial Number',
        name: 'assetSerialNumber',
        type: 'string',
        default: '',
        description: 'Serial number of the asset',
      },
      {
        displayName: 'Tag IDs',
        name: 'tagIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tag IDs',
      },
      {
        displayName: 'External IDs',
        name: 'externalIds',
        type: 'json',
        default: '{}',
        description: 'External IDs for integration',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Notes for the asset',
      },
    ],
  },

  // Update asset fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['asset'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the asset',
      },
      {
        displayName: 'Serial Number',
        name: 'assetSerialNumber',
        type: 'string',
        default: '',
        description: 'Serial number of the asset',
      },
      {
        displayName: 'Tag IDs',
        name: 'tagIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tag IDs',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Notes for the asset',
      },
    ],
  },

  // GetAll operation
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['asset'],
        operation: ['getAll', 'getLocations'],
      },
    },
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: {
      minValue: 1,
      maxValue: 512,
    },
    displayOptions: {
      show: {
        resource: ['asset'],
        operation: ['getAll', 'getLocations'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Filters
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['asset'],
        operation: ['getAll', 'getLocations', 'getStats'],
      },
    },
    options: [
      {
        displayName: 'Asset IDs',
        name: 'assetIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of asset IDs',
      },
      {
        displayName: 'Tag IDs',
        name: 'tagIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tag IDs',
      },
    ],
  },

  // Stats time range
  {
    displayName: 'Start Time',
    name: 'startTime',
    type: 'dateTime',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['asset'],
        operation: ['getStats'],
      },
    },
    description: 'Start of the time range',
  },
  {
    displayName: 'End Time',
    name: 'endTime',
    type: 'dateTime',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['asset'],
        operation: ['getStats'],
      },
    },
    description: 'End of the time range',
  },
];

export async function executeAssetOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

      const body: IDataObject = { name };

      if (additionalFields.assetSerialNumber) {
        body.assetSerialNumber = additionalFields.assetSerialNumber;
      }
      if (additionalFields.tagIds) {
        body.tagIds = (additionalFields.tagIds as string).split(',').map((id) => id.trim());
      }
      if (additionalFields.externalIds) {
        body.externalIds =
          typeof additionalFields.externalIds === 'string'
            ? JSON.parse(additionalFields.externalIds)
            : additionalFields.externalIds;
      }
      if (additionalFields.notes) {
        body.notes = additionalFields.notes;
      }

      const response = await samsaraApiRequest.call(this, 'POST', '/fleet/assets', body);
      responseData = response.data as IDataObject;
      break;
    }

    case 'get': {
      const assetId = this.getNodeParameter('assetId', i) as string;
      const response = await samsaraApiRequest.call(this, 'GET', `/fleet/assets/${assetId}`);
      responseData = response.data as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query = buildQueryString(filters);

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/assets',
          {},
          query,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/assets',
          {},
          query,
          limit,
        );
      }
      break;
    }

    case 'update': {
      const assetId = this.getNodeParameter('assetId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.name) body.name = updateFields.name;
      if (updateFields.assetSerialNumber) body.assetSerialNumber = updateFields.assetSerialNumber;
      if (updateFields.tagIds) {
        body.tagIds = (updateFields.tagIds as string).split(',').map((id) => id.trim());
      }
      if (updateFields.notes) body.notes = updateFields.notes;

      const response = await samsaraApiRequest.call(
        this,
        'PATCH',
        `/fleet/assets/${assetId}`,
        body,
      );
      responseData = response.data as IDataObject;
      break;
    }

    case 'getLocations': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query = buildQueryString(filters);

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/assets/locations',
          {},
          query,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/assets/locations',
          {},
          query,
          limit,
        );
      }
      break;
    }

    case 'getStats': {
      const startTime = this.getNodeParameter('startTime', i) as string;
      const endTime = this.getNodeParameter('endTime', i) as string;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const timeRange = formatTimeRange(startTime, endTime);

      const query = buildQueryString({
        ...timeRange,
        ...filters,
      });

      const response = await samsaraApiRequest.call(
        this,
        'GET',
        '/fleet/assets/stats',
        {},
        query,
      );
      responseData = (response.data as IDataObject[]) || [];
      break;
    }
  }

  return responseData;
}
