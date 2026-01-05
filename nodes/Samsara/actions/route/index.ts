/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { samsaraApiRequest, samsaraApiRequestAllItems } from '../../transport';
import { formatStopObject } from '../../utils';

export const routeOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['route'],
      },
    },
    options: [
      {
        name: 'Complete Stop',
        value: 'completeStop',
        description: 'Mark a route stop as complete',
        action: 'Complete a route stop',
      },
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new route',
        action: 'Create a route',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a route',
        action: 'Delete a route',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a route by ID',
        action: 'Get a route',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many routes',
        action: 'Get many routes',
      },
      {
        name: 'Get Progress',
        value: 'getProgress',
        description: 'Get route progress',
        action: 'Get route progress',
      },
      {
        name: 'Get Stops',
        value: 'getStops',
        description: 'Get route stops',
        action: 'Get route stops',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a route',
        action: 'Update a route',
      },
    ],
    default: 'getAll',
  },
];

export const routeFields: INodeProperties[] = [
  // Route ID for get, update, delete operations
  {
    displayName: 'Route ID',
    name: 'routeId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['route'],
        operation: ['get', 'update', 'delete', 'getProgress', 'getStops'],
      },
    },
    description: 'The ID of the route',
  },

  // Create route fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['route'],
        operation: ['create'],
      },
    },
    description: 'The name of the route',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['route'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Driver ID',
        name: 'driverId',
        type: 'string',
        default: '',
        description: 'ID of the assigned driver',
      },
      {
        displayName: 'Vehicle ID',
        name: 'vehicleId',
        type: 'string',
        default: '',
        description: 'ID of the assigned vehicle',
      },
      {
        displayName: 'Scheduled Start Time',
        name: 'scheduledStartTime',
        type: 'dateTime',
        default: '',
        description: 'Scheduled start time for the route',
      },
      {
        displayName: 'Scheduled End Time',
        name: 'scheduledEndTime',
        type: 'dateTime',
        default: '',
        description: 'Scheduled end time for the route',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Notes for the route',
      },
      {
        displayName: 'External IDs',
        name: 'externalIds',
        type: 'json',
        default: '{}',
        description: 'External IDs for integration',
      },
    ],
  },

  // Stops
  {
    displayName: 'Stops',
    name: 'stops',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Stop',
    default: {},
    displayOptions: {
      show: {
        resource: ['route'],
        operation: ['create'],
      },
    },
    options: [
      {
        name: 'stopValues',
        displayName: 'Stop',
        values: [
          {
            displayName: 'Name',
            name: 'name',
            type: 'string',
            default: '',
            description: 'Name of the stop',
          },
          {
            displayName: 'Address ID',
            name: 'addressId',
            type: 'string',
            default: '',
            description: 'ID of a saved address (alternative to lat/lng)',
          },
          {
            displayName: 'Latitude',
            name: 'latitude',
            type: 'number',
            default: 0,
            description: 'Latitude of the stop',
          },
          {
            displayName: 'Longitude',
            name: 'longitude',
            type: 'number',
            default: 0,
            description: 'Longitude of the stop',
          },
          {
            displayName: 'Scheduled Arrival',
            name: 'scheduledArrivalTime',
            type: 'dateTime',
            default: '',
            description: 'Scheduled arrival time',
          },
          {
            displayName: 'Scheduled Departure',
            name: 'scheduledDepartureTime',
            type: 'dateTime',
            default: '',
            description: 'Scheduled departure time',
          },
          {
            displayName: 'Notes',
            name: 'notes',
            type: 'string',
            default: '',
            description: 'Notes for the stop',
          },
        ],
      },
    ],
  },

  // Update route fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['route'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The name of the route',
      },
      {
        displayName: 'Driver ID',
        name: 'driverId',
        type: 'string',
        default: '',
        description: 'ID of the assigned driver',
      },
      {
        displayName: 'Vehicle ID',
        name: 'vehicleId',
        type: 'string',
        default: '',
        description: 'ID of the assigned vehicle',
      },
      {
        displayName: 'Scheduled Start Time',
        name: 'scheduledStartTime',
        type: 'dateTime',
        default: '',
        description: 'Scheduled start time for the route',
      },
      {
        displayName: 'Scheduled End Time',
        name: 'scheduledEndTime',
        type: 'dateTime',
        default: '',
        description: 'Scheduled end time for the route',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Notes for the route',
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
        resource: ['route'],
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
        resource: ['route'],
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
        resource: ['route'],
        operation: ['getAll'],
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
        displayName: 'Start Time',
        name: 'startTime',
        type: 'dateTime',
        default: '',
        description: 'Filter routes starting after this time',
      },
      {
        displayName: 'End Time',
        name: 'endTime',
        type: 'dateTime',
        default: '',
        description: 'Filter routes ending before this time',
      },
    ],
  },

  // Complete stop fields
  {
    displayName: 'Route ID',
    name: 'completeRouteId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['route'],
        operation: ['completeStop'],
      },
    },
    description: 'The ID of the route',
  },
  {
    displayName: 'Stop ID',
    name: 'stopId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['route'],
        operation: ['completeStop'],
      },
    },
    description: 'The ID of the stop to mark as complete',
  },
];

export async function executeRouteOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'create': {
      const name = this.getNodeParameter('name', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const stopsData = this.getNodeParameter('stops', i) as IDataObject;

      const body: IDataObject = { name };

      // Process additional fields
      if (additionalFields.driverId) {
        body.driverId = additionalFields.driverId;
      }
      if (additionalFields.vehicleId) {
        body.vehicleId = additionalFields.vehicleId;
      }
      if (additionalFields.scheduledStartTime) {
        body.scheduledStartTime = new Date(
          additionalFields.scheduledStartTime as string,
        ).toISOString();
      }
      if (additionalFields.scheduledEndTime) {
        body.scheduledEndTime = new Date(additionalFields.scheduledEndTime as string).toISOString();
      }
      if (additionalFields.notes) {
        body.notes = additionalFields.notes;
      }
      if (additionalFields.externalIds) {
        body.externalIds =
          typeof additionalFields.externalIds === 'string'
            ? JSON.parse(additionalFields.externalIds)
            : additionalFields.externalIds;
      }

      // Process stops
      if (stopsData.stopValues && Array.isArray(stopsData.stopValues)) {
        body.stops = (stopsData.stopValues as IDataObject[]).map((stop) => formatStopObject(stop));
      }

      const response = await samsaraApiRequest.call(this, 'POST', '/fleet/routes', body);
      responseData = response.data as IDataObject;
      break;
    }

    case 'get': {
      const routeId = this.getNodeParameter('routeId', i) as string;
      const response = await samsaraApiRequest.call(this, 'GET', `/fleet/routes/${routeId}`);
      responseData = response.data as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;

      const query: IDataObject = {};
      if (filters.driverIds) query.driverIds = filters.driverIds;
      if (filters.vehicleIds) query.vehicleIds = filters.vehicleIds;
      if (filters.startTime)
        query.startTime = new Date(filters.startTime as string).toISOString();
      if (filters.endTime) query.endTime = new Date(filters.endTime as string).toISOString();

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(this, 'GET', '/fleet/routes', {}, query);
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/routes',
          {},
          query,
          limit,
        );
      }
      break;
    }

    case 'update': {
      const routeId = this.getNodeParameter('routeId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.name) body.name = updateFields.name;
      if (updateFields.driverId) body.driverId = updateFields.driverId;
      if (updateFields.vehicleId) body.vehicleId = updateFields.vehicleId;
      if (updateFields.scheduledStartTime) {
        body.scheduledStartTime = new Date(
          updateFields.scheduledStartTime as string,
        ).toISOString();
      }
      if (updateFields.scheduledEndTime) {
        body.scheduledEndTime = new Date(updateFields.scheduledEndTime as string).toISOString();
      }
      if (updateFields.notes) body.notes = updateFields.notes;

      const response = await samsaraApiRequest.call(
        this,
        'PATCH',
        `/fleet/routes/${routeId}`,
        body,
      );
      responseData = response.data as IDataObject;
      break;
    }

    case 'delete': {
      const routeId = this.getNodeParameter('routeId', i) as string;
      await samsaraApiRequest.call(this, 'DELETE', `/fleet/routes/${routeId}`);
      responseData = { success: true, routeId };
      break;
    }

    case 'getProgress': {
      const routeId = this.getNodeParameter('routeId', i) as string;
      const response = await samsaraApiRequest.call(
        this,
        'GET',
        `/fleet/routes/${routeId}/progress`,
      );
      responseData = response.data as IDataObject;
      break;
    }

    case 'getStops': {
      const routeId = this.getNodeParameter('routeId', i) as string;
      const response = await samsaraApiRequest.call(this, 'GET', `/fleet/routes/${routeId}`);
      responseData = ((response.data as IDataObject)?.stops as IDataObject[]) || [];
      break;
    }

    case 'completeStop': {
      const routeId = this.getNodeParameter('completeRouteId', i) as string;
      const stopId = this.getNodeParameter('stopId', i) as string;

      const response = await samsaraApiRequest.call(
        this,
        'PATCH',
        `/fleet/routes/${routeId}/stops/${stopId}`,
        { state: 'completed' },
      );
      responseData = response.data as IDataObject;
      break;
    }
  }

  return responseData;
}
