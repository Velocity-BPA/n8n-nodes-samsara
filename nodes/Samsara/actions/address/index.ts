/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { samsaraApiRequest, samsaraApiRequestAllItems, buildQueryString } from '../../transport';
import { formatGeofence } from '../../utils';

export const addressOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['address'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new address',
        action: 'Create an address',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete an address',
        action: 'Delete an address',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get an address by ID',
        action: 'Get an address',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many addresses',
        action: 'Get many addresses',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an address',
        action: 'Update an address',
      },
    ],
    default: 'getAll',
  },
];

export const addressFields: INodeProperties[] = [
  // Address ID for get, update, delete operations
  {
    displayName: 'Address ID',
    name: 'addressId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['address'],
        operation: ['get', 'update', 'delete'],
      },
    },
    description: 'The ID of the address',
  },

  // Create address fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['address'],
        operation: ['create'],
      },
    },
    description: 'The name of the address/location',
  },
  {
    displayName: 'Formatted Address',
    name: 'formattedAddress',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['address'],
        operation: ['create'],
      },
    },
    description: 'The full formatted address',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['address'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Latitude',
        name: 'latitude',
        type: 'number',
        default: 0,
        description: 'Latitude coordinate',
      },
      {
        displayName: 'Longitude',
        name: 'longitude',
        type: 'number',
        default: 0,
        description: 'Longitude coordinate',
      },
      {
        displayName: 'Tag IDs',
        name: 'tagIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tag IDs',
      },
      {
        displayName: 'Contact IDs',
        name: 'contactIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of contact IDs',
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
        description: 'Notes for the address',
      },
    ],
  },

  // Geofence configuration
  {
    displayName: 'Geofence',
    name: 'geofence',
    type: 'collection',
    placeholder: 'Configure Geofence',
    default: {},
    displayOptions: {
      show: {
        resource: ['address'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Circle', value: 'circle' },
          { name: 'Polygon', value: 'polygon' },
        ],
        default: 'circle',
        description: 'Type of geofence',
      },
      {
        displayName: 'Latitude (Circle)',
        name: 'latitude',
        type: 'number',
        default: 0,
        description: 'Center latitude for circle geofence',
      },
      {
        displayName: 'Longitude (Circle)',
        name: 'longitude',
        type: 'number',
        default: 0,
        description: 'Center longitude for circle geofence',
      },
      {
        displayName: 'Radius (Meters)',
        name: 'radiusMeters',
        type: 'number',
        default: 100,
        description: 'Radius in meters for circle geofence',
      },
      {
        displayName: 'Vertices (Polygon)',
        name: 'vertices',
        type: 'json',
        default: '[]',
        description:
          'Array of {latitude, longitude} points for polygon geofence. Example: [{"latitude": 37.7749, "longitude": -122.4194}]',
      },
    ],
  },

  // Update address fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['address'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the address/location',
      },
      {
        displayName: 'Formatted Address',
        name: 'formattedAddress',
        type: 'string',
        default: '',
        description: 'The full formatted address',
      },
      {
        displayName: 'Latitude',
        name: 'latitude',
        type: 'number',
        default: 0,
        description: 'Latitude coordinate',
      },
      {
        displayName: 'Longitude',
        name: 'longitude',
        type: 'number',
        default: 0,
        description: 'Longitude coordinate',
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
        description: 'Notes for the address',
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
        resource: ['address'],
        operation: ['getAll'],
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
        resource: ['address'],
        operation: ['getAll'],
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
        resource: ['address'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Tag IDs',
        name: 'tagIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tag IDs',
      },
    ],
  },
];

export async function executeAddressOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const formattedAddress = this.getNodeParameter('formattedAddress', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const geofenceConfig = this.getNodeParameter('geofence', i) as IDataObject;

      const body: IDataObject = {
        name,
        formattedAddress,
      };

      // Add coordinates
      if (additionalFields.latitude !== undefined && additionalFields.longitude !== undefined) {
        body.latitude = additionalFields.latitude;
        body.longitude = additionalFields.longitude;
      }

      // Process tags
      if (additionalFields.tagIds) {
        body.tagIds = (additionalFields.tagIds as string).split(',').map((id) => id.trim());
      }

      // Process contacts
      if (additionalFields.contactIds) {
        body.contactIds = (additionalFields.contactIds as string).split(',').map((id) => id.trim());
      }

      // Process external IDs
      if (additionalFields.externalIds) {
        body.externalIds =
          typeof additionalFields.externalIds === 'string'
            ? JSON.parse(additionalFields.externalIds)
            : additionalFields.externalIds;
      }

      // Add notes
      if (additionalFields.notes) {
        body.notes = additionalFields.notes;
      }

      // Add geofence
      if (geofenceConfig && Object.keys(geofenceConfig).length > 0) {
        body.geofence = formatGeofence(geofenceConfig);
      }

      const response = await samsaraApiRequest.call(this, 'POST', '/addresses', body);
      responseData = response.data as IDataObject;
      break;
    }

    case 'get': {
      const addressId = this.getNodeParameter('addressId', i) as string;
      const response = await samsaraApiRequest.call(this, 'GET', `/addresses/${addressId}`);
      responseData = response.data as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query = buildQueryString(filters);

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(this, 'GET', '/addresses', {}, query);
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/addresses',
          {},
          query,
          limit,
        );
      }
      break;
    }

    case 'update': {
      const addressId = this.getNodeParameter('addressId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.name) body.name = updateFields.name;
      if (updateFields.formattedAddress) body.formattedAddress = updateFields.formattedAddress;
      if (updateFields.latitude !== undefined) body.latitude = updateFields.latitude;
      if (updateFields.longitude !== undefined) body.longitude = updateFields.longitude;
      if (updateFields.tagIds) {
        body.tagIds = (updateFields.tagIds as string).split(',').map((id) => id.trim());
      }
      if (updateFields.notes) body.notes = updateFields.notes;

      const response = await samsaraApiRequest.call(
        this,
        'PATCH',
        `/addresses/${addressId}`,
        body,
      );
      responseData = response.data as IDataObject;
      break;
    }

    case 'delete': {
      const addressId = this.getNodeParameter('addressId', i) as string;
      await samsaraApiRequest.call(this, 'DELETE', `/addresses/${addressId}`);
      responseData = { success: true, addressId };
      break;
    }
  }

  return responseData;
}
