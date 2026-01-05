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
import { sensorDataSeriesOptions } from '../../utils';

export const sensorOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['sensor'],
      },
    },
    options: [
      {
        name: 'Get Data',
        value: 'getData',
        description: 'Get current sensor data',
        action: 'Get sensor data',
      },
      {
        name: 'Get Gateways',
        value: 'getGateways',
        description: 'Get sensor gateways',
        action: 'Get sensor gateways',
      },
      {
        name: 'Get History',
        value: 'getHistory',
        description: 'Get historical sensor readings',
        action: 'Get sensor history',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many sensors',
        action: 'Get many sensors',
      },
    ],
    default: 'getAll',
  },
];

export const sensorFields: INodeProperties[] = [
  // GetAll operation
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['sensor'],
        operation: ['getAll', 'getGateways'],
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
        resource: ['sensor'],
        operation: ['getAll', 'getGateways'],
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
        resource: ['sensor'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Sensor IDs',
        name: 'sensorIds',
        type: 'string',
        default: '',
        description: 'Comma-separated list of sensor IDs',
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

  // Get data fields
  {
    displayName: 'Sensor IDs',
    name: 'sensorIds',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['sensor'],
        operation: ['getData'],
      },
    },
    description: 'Comma-separated list of sensor IDs',
  },
  {
    displayName: 'Data Series',
    name: 'series',
    type: 'multiOptions',
    options: sensorDataSeriesOptions,
    default: ['temperature'],
    displayOptions: {
      show: {
        resource: ['sensor'],
        operation: ['getData'],
      },
    },
    description: 'Types of data to retrieve',
  },

  // History fields
  {
    displayName: 'Sensor IDs',
    name: 'historySensorIds',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['sensor'],
        operation: ['getHistory'],
      },
    },
    description: 'Comma-separated list of sensor IDs',
  },
  {
    displayName: 'Data Series',
    name: 'historySeries',
    type: 'multiOptions',
    options: sensorDataSeriesOptions,
    default: ['temperature'],
    displayOptions: {
      show: {
        resource: ['sensor'],
        operation: ['getHistory'],
      },
    },
    description: 'Types of data to retrieve',
  },
  {
    displayName: 'Start Time',
    name: 'startTime',
    type: 'dateTime',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['sensor'],
        operation: ['getHistory'],
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
        resource: ['sensor'],
        operation: ['getHistory'],
      },
    },
    description: 'End of the time range',
  },
];

export async function executeSensorOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query = buildQueryString(filters);

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/industrial/sensors',
          {},
          query,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/industrial/sensors',
          {},
          query,
          limit,
        );
      }
      break;
    }

    case 'getData': {
      const sensorIds = this.getNodeParameter('sensorIds', i) as string;
      const series = this.getNodeParameter('series', i) as string[];

      const query = buildQueryString({
        sensorIds,
        series: series.join(','),
      });

      const response = await samsaraApiRequest.call(
        this,
        'GET',
        '/industrial/sensors/data',
        {},
        query,
      );
      responseData = (response.data as IDataObject[]) || [];
      break;
    }

    case 'getHistory': {
      const sensorIds = this.getNodeParameter('historySensorIds', i) as string;
      const series = this.getNodeParameter('historySeries', i) as string[];
      const startTime = this.getNodeParameter('startTime', i) as string;
      const endTime = this.getNodeParameter('endTime', i) as string;

      const timeRange = formatTimeRange(startTime, endTime);
      const query = buildQueryString({
        sensorIds,
        series: series.join(','),
        ...timeRange,
      });

      const response = await samsaraApiRequest.call(
        this,
        'GET',
        '/industrial/sensors/history',
        {},
        query,
      );
      responseData = (response.data as IDataObject[]) || [];
      break;
    }

    case 'getGateways': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/industrial/gateways',
          {},
          {},
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/industrial/gateways',
          {},
          {},
          limit,
        );
      }
      break;
    }
  }

  return responseData;
}
