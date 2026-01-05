/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import {
  samsaraApiRequestAllItems,
  buildQueryString,
  formatTimeRange,
} from '../../transport';
import { safetyEventTypeOptions } from '../../utils';

export const safetyOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['safety'],
      },
    },
    options: [
      {
        name: 'Get Collisions',
        value: 'getCollisions',
        description: 'Get collision events',
        action: 'Get collision events',
      },
      {
        name: 'Get Events',
        value: 'getEvents',
        description: 'Get safety events',
        action: 'Get safety events',
      },
      {
        name: 'Get Harsh Driving',
        value: 'getHarshDriving',
        description: 'Get harsh driving events',
        action: 'Get harsh driving events',
      },
      {
        name: 'Get Scores',
        value: 'getScores',
        description: 'Get safety scores',
        action: 'Get safety scores',
      },
    ],
    default: 'getEvents',
  },
];

export const safetyFields: INodeProperties[] = [
  // Time range for all operations
  {
    displayName: 'Start Time',
    name: 'startTime',
    type: 'dateTime',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['safety'],
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
        resource: ['safety'],
      },
    },
    description: 'End of the time range',
  },

  // Filters for events
  {
    displayName: 'Options',
    name: 'eventOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['safety'],
        operation: ['getEvents', 'getHarshDriving'],
      },
    },
    options: [
      {
        displayName: 'Driver IDs',
        name: 'driverIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of driver IDs',
      },
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
        description: 'Filter by specific event types',
      },
    ],
  },

  // Filters for scores
  {
    displayName: 'Options',
    name: 'scoreOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['safety'],
        operation: ['getScores'],
      },
    },
    options: [
      {
        displayName: 'Driver IDs',
        name: 'driverIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of driver IDs',
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

  // Filters for collisions
  {
    displayName: 'Options',
    name: 'collisionOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['safety'],
        operation: ['getCollisions'],
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

  // Return all
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['safety'],
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
        resource: ['safety'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
];

export async function executeSafetyOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  const startTime = this.getNodeParameter('startTime', i) as string;
  const endTime = this.getNodeParameter('endTime', i) as string;
  const timeRange = formatTimeRange(startTime, endTime);
  const returnAll = this.getNodeParameter('returnAll', i) as boolean;

  switch (operation) {
    case 'getEvents': {
      const options = this.getNodeParameter('eventOptions', i) as IDataObject;
      const query = buildQueryString({
        ...timeRange,
        ...options,
        eventTypes: options.eventTypes
          ? (options.eventTypes as string[]).join(',')
          : undefined,
      });

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/safety/events',
          {},
          query,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/safety/events',
          {},
          query,
          limit,
        );
      }
      break;
    }

    case 'getScores': {
      const options = this.getNodeParameter('scoreOptions', i) as IDataObject;
      const query = buildQueryString({
        ...timeRange,
        ...options,
      });

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/drivers/safety-scores',
          {},
          query,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/drivers/safety-scores',
          {},
          query,
          limit,
        );
      }
      break;
    }

    case 'getHarshDriving': {
      const options = this.getNodeParameter('eventOptions', i) as IDataObject;
      const query = buildQueryString({
        ...timeRange,
        ...options,
        eventTypes: options.eventTypes
          ? (options.eventTypes as string[]).join(',')
          : undefined,
      });

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/vehicles/harsh-events',
          {},
          query,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/vehicles/harsh-events',
          {},
          query,
          limit,
        );
      }
      break;
    }

    case 'getCollisions': {
      const options = this.getNodeParameter('collisionOptions', i) as IDataObject;
      const query = buildQueryString({
        ...timeRange,
        ...options,
      });

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/safety/collisions',
          {},
          query,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/safety/collisions',
          {},
          query,
          limit,
        );
      }
      break;
    }
  }

  return responseData;
}
