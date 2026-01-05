/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { samsaraApiRequest, samsaraApiRequestAllItems } from '../../transport';

export const tagOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['tag'],
      },
    },
    options: [
      {
        name: 'Assign',
        value: 'assign',
        description: 'Assign entities to a tag',
        action: 'Assign entities to a tag',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new tag',
        action: 'Create a tag',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a tag',
        action: 'Delete a tag',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a tag by ID',
        action: 'Get a tag',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many tags',
        action: 'Get many tags',
      },
      {
        name: 'Unassign',
        value: 'unassign',
        description: 'Remove entities from a tag',
        action: 'Unassign entities from a tag',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a tag',
        action: 'Update a tag',
      },
    ],
    default: 'getAll',
  },
];

export const tagFields: INodeProperties[] = [
  // Tag ID for get, update, delete, assign, unassign operations
  {
    displayName: 'Tag ID',
    name: 'tagId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['tag'],
        operation: ['get', 'update', 'delete', 'assign', 'unassign'],
      },
    },
    description: 'The ID of the tag',
  },

  // Create tag fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['tag'],
        operation: ['create'],
      },
    },
    description: 'The name of the tag',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['tag'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Parent Tag ID',
        name: 'parentTagId',
        type: 'string',
        default: '',
        description: 'ID of the parent tag for hierarchy',
      },
      {
        displayName: 'Address IDs',
        name: 'addressIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of address IDs to associate',
      },
      {
        displayName: 'Asset IDs',
        name: 'assetIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of asset IDs to associate',
      },
      {
        displayName: 'Driver IDs',
        name: 'driverIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of driver IDs to associate',
      },
      {
        displayName: 'Vehicle IDs',
        name: 'vehicleIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of vehicle IDs to associate',
      },
    ],
  },

  // Update tag fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['tag'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the tag',
      },
      {
        displayName: 'Parent Tag ID',
        name: 'parentTagId',
        type: 'string',
        default: '',
        description: 'ID of the parent tag for hierarchy',
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
        resource: ['tag'],
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
        resource: ['tag'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Assign/Unassign fields
  {
    displayName: 'Entity Type',
    name: 'entityType',
    type: 'options',
    required: true,
    options: [
      { name: 'Addresses', value: 'addresses' },
      { name: 'Assets', value: 'assets' },
      { name: 'Drivers', value: 'drivers' },
      { name: 'Vehicles', value: 'vehicles' },
    ],
    default: 'vehicles',
    displayOptions: {
      show: {
        resource: ['tag'],
        operation: ['assign', 'unassign'],
      },
    },
    description: 'The type of entities to assign/unassign',
  },
  {
    displayName: 'Entity IDs',
    name: 'entityIds',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['tag'],
        operation: ['assign', 'unassign'],
      },
    },
    description: 'Comma-separated list of entity IDs to assign/unassign',
  },
];

export async function executeTagOperation(
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

      if (additionalFields.parentTagId) {
        body.parentTagId = additionalFields.parentTagId;
      }

      // Process entity associations
      const entityTypes = ['addressIds', 'assetIds', 'driverIds', 'vehicleIds'];
      for (const entityType of entityTypes) {
        if (additionalFields[entityType]) {
          body[entityType] = (additionalFields[entityType] as string)
            .split(',')
            .map((id) => id.trim());
        }
      }

      const response = await samsaraApiRequest.call(this, 'POST', '/tags', body);
      responseData = response.data as IDataObject;
      break;
    }

    case 'get': {
      const tagId = this.getNodeParameter('tagId', i) as string;
      const response = await samsaraApiRequest.call(this, 'GET', `/tags/${tagId}`);
      responseData = response.data as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(this, 'GET', '/tags', {}, {});
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(this, 'GET', '/tags', {}, {}, limit);
      }
      break;
    }

    case 'update': {
      const tagId = this.getNodeParameter('tagId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.name) body.name = updateFields.name;
      if (updateFields.parentTagId) body.parentTagId = updateFields.parentTagId;

      const response = await samsaraApiRequest.call(this, 'PATCH', `/tags/${tagId}`, body);
      responseData = response.data as IDataObject;
      break;
    }

    case 'delete': {
      const tagId = this.getNodeParameter('tagId', i) as string;
      await samsaraApiRequest.call(this, 'DELETE', `/tags/${tagId}`);
      responseData = { success: true, tagId };
      break;
    }

    case 'assign': {
      const tagId = this.getNodeParameter('tagId', i) as string;
      const entityType = this.getNodeParameter('entityType', i) as string;
      const entityIds = this.getNodeParameter('entityIds', i) as string;

      const ids = entityIds.split(',').map((id) => id.trim());
      const body: IDataObject = {
        [entityType]: ids.map((id) => ({ id })),
      };

      const response = await samsaraApiRequest.call(this, 'PATCH', `/tags/${tagId}`, body);
      responseData = response.data as IDataObject;
      break;
    }

    case 'unassign': {
      const tagId = this.getNodeParameter('tagId', i) as string;
      const entityType = this.getNodeParameter('entityType', i) as string;
      const entityIds = this.getNodeParameter('entityIds', i) as string;

      // Get current tag to remove entities
      const currentTag = await samsaraApiRequest.call(this, 'GET', `/tags/${tagId}`);
      const currentEntities = ((currentTag.data as IDataObject)?.[entityType] as IDataObject[]) || [];
      const idsToRemove = entityIds.split(',').map((id) => id.trim());
      const remainingEntities = currentEntities.filter(
        (entity) => !idsToRemove.includes(entity.id as string),
      );

      const body: IDataObject = {
        [entityType]: remainingEntities.map((entity) => ({ id: entity.id })),
      };

      const response = await samsaraApiRequest.call(this, 'PATCH', `/tags/${tagId}`, body);
      responseData = response.data as IDataObject;
      break;
    }
  }

  return responseData;
}
