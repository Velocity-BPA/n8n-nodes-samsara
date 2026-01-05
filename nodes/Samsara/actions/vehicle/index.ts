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
import { statsTypeOptions, safetyEventTypeOptions } from '../../utils';

export const vehicleOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['vehicle'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Get a vehicle by ID',
        action: 'Get a vehicle',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many vehicles',
        action: 'Get many vehicles',
      },
      {
        name: 'Get Stats',
        value: 'getStats',
        description: 'Get vehicle statistics',
        action: 'Get vehicle stats',
      },
      {
        name: 'Get Stats Feed',
        value: 'getStatsFeed',
        description: 'Get continuous vehicle stats feed',
        action: 'Get vehicle stats feed',
      },
      {
        name: 'Get Stats History',
        value: 'getStatsHistory',
        description: 'Get historical vehicle stats',
        action: 'Get vehicle stats history',
      },
      {
        name: 'Get Locations',
        value: 'getLocations',
        description: 'Get current vehicle locations',
        action: 'Get vehicle locations',
      },
      {
        name: 'Get Harsh Events',
        value: 'getHarshEvents',
        description: 'Get harsh driving events',
        action: 'Get harsh events',
      },
      {
        name: 'Get Safety Events',
        value: 'getSafetyEvents',
        description: 'Get safety events for vehicles',
        action: 'Get safety events',
      },
    ],
    default: 'getAll',
  },
];

export const vehicleFields: INodeProperties[] = [
  // Get operation
  {
    displayName: 'Vehicle ID',
    name: 'vehicleId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['vehicle'],
        operation: ['get'],
      },
    },
    description: 'The ID of the vehicle to retrieve',
  },

  // GetAll operation
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['vehicle'],
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
        resource: ['vehicle'],
        operation: ['getAll', 'getLocations'],
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
        resource: ['vehicle'],
        operation: ['getAll', 'getLocations'],
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
        displayName: 'Vehicle IDs',
        name: 'vehicleIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of vehicle IDs to filter by',
      },
    ],
  },

  // Stats operations
  {
    displayName: 'Stats Types',
    name: 'types',
    type: 'multiOptions',
    options: statsTypeOptions,
    default: ['gps'],
    displayOptions: {
      show: {
        resource: ['vehicle'],
        operation: ['getStats', 'getStatsFeed', 'getStatsHistory'],
      },
    },
    description: 'The types of vehicle stats to retrieve',
  },

  // Stats filters
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['vehicle'],
        operation: ['getStats', 'getStatsFeed'],
      },
    },
    options: [
      {
        displayName: 'Vehicle IDs',
        name: 'vehicleIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of vehicle IDs',
      },
      {
        displayName: 'Tag IDs',
        name: 'tagIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tag IDs',
      },
      {
        displayName: 'After Cursor',
        name: 'after',
        type: 'string',
        default: '',
        description: 'Pagination cursor from previous response',
      },
      {
        displayName: 'Include Decorations',
        name: 'decorations',
        type: 'multiOptions',
        options: [
          { name: 'Driver', value: 'driver' },
          { name: 'Tags', value: 'tags' },
          { name: 'Vehicle Info', value: 'vehicleInfo' },
        ],
        default: [],
        description: 'Additional context to include',
      },
    ],
  },

  // Stats history specific
  {
    displayName: 'Start Time',
    name: 'startTime',
    type: 'dateTime',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['vehicle'],
        operation: ['getStatsHistory', 'getHarshEvents', 'getSafetyEvents'],
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
        resource: ['vehicle'],
        operation: ['getStatsHistory', 'getHarshEvents', 'getSafetyEvents'],
      },
    },
    description: 'End of the time range',
  },

  // History options
  {
    displayName: 'Options',
    name: 'historyOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['vehicle'],
        operation: ['getStatsHistory'],
      },
    },
    options: [
      {
        displayName: 'Vehicle IDs',
        name: 'vehicleIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of vehicle IDs',
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

  // Safety events options
  {
    displayName: 'Options',
    name: 'safetyOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['vehicle'],
        operation: ['getHarshEvents', 'getSafetyEvents'],
      },
    },
    options: [
      {
        displayName: 'Vehicle IDs',
        name: 'vehicleIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of vehicle IDs',
      },
      {
        displayName: 'Tag IDs',
        name: 'tagIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of tag IDs',
      },
      {
        displayName: 'Event Types',
        name: 'eventTypes',
        type: 'multiOptions',
        options: safetyEventTypeOptions,
        default: [],
        description: 'Filter by event types',
      },
    ],
  },
];

export async function executeVehicleOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'get': {
      const vehicleId = this.getNodeParameter('vehicleId', i) as string;
      const response = await samsaraApiRequest.call(this, 'GET', `/fleet/vehicles/${vehicleId}`);
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
          '/fleet/vehicles',
          {},
          query,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/vehicles',
          {},
          query,
          limit,
        );
      }
      break;
    }

    case 'getStats': {
      const types = this.getNodeParameter('types', i) as string[];
      const options = this.getNodeParameter('options', i) as IDataObject;
      const query = buildQueryString({
        types: types.join(','),
        ...options,
      });
      const response = await samsaraApiRequest.call(this, 'GET', '/fleet/vehicles/stats', {}, query);
      responseData = (response.data as IDataObject[]) || [];
      break;
    }

    case 'getStatsFeed': {
      const types = this.getNodeParameter('types', i) as string[];
      const options = this.getNodeParameter('options', i) as IDataObject;
      const query = buildQueryString({
        types: types.join(','),
        ...options,
      });
      const response = await samsaraApiRequest.call(
        this,
        'GET',
        '/fleet/vehicles/stats/feed',
        {},
        query,
      );
      responseData = response as IDataObject;
      break;
    }

    case 'getStatsHistory': {
      const types = this.getNodeParameter('types', i) as string[];
      const startTime = this.getNodeParameter('startTime', i) as string;
      const endTime = this.getNodeParameter('endTime', i) as string;
      const historyOptions = this.getNodeParameter('historyOptions', i) as IDataObject;
      const timeRange = formatTimeRange(startTime, endTime);
      const query = buildQueryString({
        types: types.join(','),
        ...timeRange,
        ...historyOptions,
      });
      const response = await samsaraApiRequest.call(
        this,
        'GET',
        '/fleet/vehicles/stats/history',
        {},
        query,
      );
      responseData = (response.data as IDataObject[]) || [];
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
          '/fleet/vehicles/locations',
          {},
          query,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/vehicles/locations',
          {},
          query,
          limit,
        );
      }
      break;
    }

    case 'getHarshEvents': {
      const startTime = this.getNodeParameter('startTime', i) as string;
      const endTime = this.getNodeParameter('endTime', i) as string;
      const safetyOptions = this.getNodeParameter('safetyOptions', i) as IDataObject;
      const timeRange = formatTimeRange(startTime, endTime);
      const query = buildQueryString({
        ...timeRange,
        ...safetyOptions,
      });
      const response = await samsaraApiRequest.call(
        this,
        'GET',
        '/fleet/vehicles/harsh-events',
        {},
        query,
      );
      responseData = (response.data as IDataObject[]) || [];
      break;
    }

    case 'getSafetyEvents': {
      const startTime = this.getNodeParameter('startTime', i) as string;
      const endTime = this.getNodeParameter('endTime', i) as string;
      const safetyOptions = this.getNodeParameter('safetyOptions', i) as IDataObject;
      const timeRange = formatTimeRange(startTime, endTime);
      const query = buildQueryString({
        ...timeRange,
        ...safetyOptions,
      });
      const response = await samsaraApiRequest.call(
        this,
        'GET',
        '/fleet/safety/events',
        {},
        query,
      );
      responseData = (response.data as IDataObject[]) || [];
      break;
    }
  }

  return responseData;
}
