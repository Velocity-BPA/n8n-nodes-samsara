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

export const driverOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['driver'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new driver',
        action: 'Create a driver',
      },
      {
        name: 'Deactivate',
        value: 'deactivate',
        description: 'Deactivate a driver',
        action: 'Deactivate a driver',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a driver by ID',
        action: 'Get a driver',
      },
      {
        name: 'Get HOS Logs',
        value: 'getHosLogs',
        description: 'Get Hours of Service logs',
        action: 'Get HOS logs',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many drivers',
        action: 'Get many drivers',
      },
      {
        name: 'Get Performance',
        value: 'getPerformance',
        description: 'Get driver performance metrics',
        action: 'Get driver performance',
      },
      {
        name: 'Get Safety Score',
        value: 'getSafetyScore',
        description: 'Get driver safety score',
        action: 'Get driver safety score',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a driver',
        action: 'Update a driver',
      },
    ],
    default: 'getAll',
  },
];

export const driverFields: INodeProperties[] = [
  // Driver ID for get, update, deactivate operations
  {
    displayName: 'Driver ID',
    name: 'driverId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['driver'],
        operation: ['get', 'update', 'deactivate', 'getSafetyScore', 'getPerformance'],
      },
    },
    description: 'The ID of the driver',
  },

  // Create driver fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['driver'],
        operation: ['create'],
      },
    },
    description: 'The full name of the driver',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['driver'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        default: '',
        description: 'Login username for the driver',
      },
      {
        displayName: 'Password',
        name: 'password',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'Login password for the driver',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'Phone number of the driver',
      },
      {
        displayName: 'License Number',
        name: 'driverLicenseNumber',
        type: 'string',
        default: '',
        description: "Driver's license number",
      },
      {
        displayName: 'License State',
        name: 'driverLicenseState',
        type: 'string',
        default: '',
        description: 'State/Province of license issuance',
      },
      {
        displayName: 'ELD Exempt',
        name: 'eldExempt',
        type: 'boolean',
        default: false,
        description: 'Whether the driver is ELD exempt',
      },
      {
        displayName: 'ELD Exempt Reason',
        name: 'eldExemptReason',
        type: 'string',
        default: '',
        description: 'Reason for ELD exemption',
      },
      {
        displayName: 'Tag IDs',
        name: 'tagIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tag IDs to associate',
      },
      {
        displayName: 'External IDs',
        name: 'externalIds',
        type: 'json',
        default: '{}',
        description: 'External IDs for integration (JSON object)',
      },
    ],
  },

  // Update driver fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['driver'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The full name of the driver',
      },
      {
        displayName: 'Username',
        name: 'username',
        type: 'string',
        default: '',
        description: 'Login username for the driver',
      },
      {
        displayName: 'Password',
        name: 'password',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'Login password for the driver',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'Phone number of the driver',
      },
      {
        displayName: 'License Number',
        name: 'driverLicenseNumber',
        type: 'string',
        default: '',
        description: "Driver's license number",
      },
      {
        displayName: 'License State',
        name: 'driverLicenseState',
        type: 'string',
        default: '',
        description: 'State/Province of license issuance',
      },
      {
        displayName: 'ELD Exempt',
        name: 'eldExempt',
        type: 'boolean',
        default: false,
        description: 'Whether the driver is ELD exempt',
      },
      {
        displayName: 'ELD Exempt Reason',
        name: 'eldExemptReason',
        type: 'string',
        default: '',
        description: 'Reason for ELD exemption',
      },
      {
        displayName: 'Tag IDs',
        name: 'tagIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tag IDs to associate',
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
        resource: ['driver'],
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
        resource: ['driver'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },

  // Filters for getAll
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['driver'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Tag IDs',
        name: 'tagIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tag IDs to filter by',
      },
      {
        displayName: 'Driver IDs',
        name: 'driverIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of driver IDs to filter by',
      },
      {
        displayName: 'Driver Status',
        name: 'driverActivationStatus',
        type: 'options',
        options: [
          { name: 'Active', value: 'active' },
          { name: 'Deactivated', value: 'deactivated' },
        ],
        default: 'active',
        description: 'Filter by activation status',
      },
    ],
  },

  // HOS Logs
  {
    displayName: 'Driver IDs',
    name: 'hosDriverIds',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['driver'],
        operation: ['getHosLogs'],
      },
    },
    description: 'Comma-separated list of driver IDs',
  },
  {
    displayName: 'Start Time',
    name: 'startTime',
    type: 'dateTime',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['driver'],
        operation: ['getHosLogs', 'getSafetyScore', 'getPerformance'],
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
        resource: ['driver'],
        operation: ['getHosLogs', 'getSafetyScore', 'getPerformance'],
      },
    },
    description: 'End of the time range',
  },
];

export async function executeDriverOperation(
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

      if (additionalFields.tagIds) {
        body.tagIds = (additionalFields.tagIds as string).split(',').map((id) => id.trim());
      }

      if (additionalFields.externalIds) {
        body.externalIds =
          typeof additionalFields.externalIds === 'string'
            ? JSON.parse(additionalFields.externalIds)
            : additionalFields.externalIds;
      }

      // Copy other fields
      const fieldsToCopy = [
        'username',
        'password',
        'phone',
        'driverLicenseNumber',
        'driverLicenseState',
        'eldExempt',
        'eldExemptReason',
      ];
      for (const field of fieldsToCopy) {
        if (additionalFields[field] !== undefined && additionalFields[field] !== '') {
          body[field] = additionalFields[field];
        }
      }

      const response = await samsaraApiRequest.call(this, 'POST', '/fleet/drivers', body);
      responseData = response.data as IDataObject;
      break;
    }

    case 'get': {
      const driverId = this.getNodeParameter('driverId', i) as string;
      const response = await samsaraApiRequest.call(this, 'GET', `/fleet/drivers/${driverId}`);
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
          '/fleet/drivers',
          {},
          query,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/drivers',
          {},
          query,
          limit,
        );
      }
      break;
    }

    case 'update': {
      const driverId = this.getNodeParameter('driverId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.tagIds) {
        body.tagIds = (updateFields.tagIds as string).split(',').map((id) => id.trim());
      }

      const fieldsToCopy = [
        'name',
        'username',
        'password',
        'phone',
        'driverLicenseNumber',
        'driverLicenseState',
        'eldExempt',
        'eldExemptReason',
      ];
      for (const field of fieldsToCopy) {
        if (updateFields[field] !== undefined && updateFields[field] !== '') {
          body[field] = updateFields[field];
        }
      }

      const response = await samsaraApiRequest.call(
        this,
        'PATCH',
        `/fleet/drivers/${driverId}`,
        body,
      );
      responseData = response.data as IDataObject;
      break;
    }

    case 'deactivate': {
      const driverId = this.getNodeParameter('driverId', i) as string;
      const response = await samsaraApiRequest.call(
        this,
        'PATCH',
        `/fleet/drivers/${driverId}`,
        { driverActivationStatus: 'deactivated' },
      );
      responseData = response.data as IDataObject;
      break;
    }

    case 'getHosLogs': {
      const driverIds = this.getNodeParameter('hosDriverIds', i) as string;
      const startTime = this.getNodeParameter('startTime', i) as string;
      const endTime = this.getNodeParameter('endTime', i) as string;
      const timeRange = formatTimeRange(startTime, endTime);

      const query = buildQueryString({
        driverIds,
        ...timeRange,
      });

      const response = await samsaraApiRequest.call(this, 'GET', '/fleet/hos/logs', {}, query);
      responseData = (response.data as IDataObject[]) || [];
      break;
    }

    case 'getSafetyScore': {
      const driverId = this.getNodeParameter('driverId', i) as string;
      const startTime = this.getNodeParameter('startTime', i) as string;
      const endTime = this.getNodeParameter('endTime', i) as string;
      const timeRange = formatTimeRange(startTime, endTime);

      const query = buildQueryString({
        driverIds: driverId,
        ...timeRange,
      });

      const response = await samsaraApiRequest.call(
        this,
        'GET',
        '/fleet/drivers/safety-scores',
        {},
        query,
      );
      responseData = (response.data as IDataObject[]) || [];
      break;
    }

    case 'getPerformance': {
      const driverId = this.getNodeParameter('driverId', i) as string;
      const startTime = this.getNodeParameter('startTime', i) as string;
      const endTime = this.getNodeParameter('endTime', i) as string;
      const timeRange = formatTimeRange(startTime, endTime);

      const query = buildQueryString({
        driverIds: driverId,
        ...timeRange,
      });

      const response = await samsaraApiRequest.call(
        this,
        'GET',
        '/fleet/drivers/efficiency',
        {},
        query,
      );
      responseData = (response.data as IDataObject[]) || [];
      break;
    }
  }

  return responseData;
}
