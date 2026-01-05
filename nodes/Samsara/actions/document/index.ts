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
  formatTimeRange,
} from '../../transport';

export const documentOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['document'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new document',
        action: 'Create a document',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a document by ID',
        action: 'Get a document',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many documents',
        action: 'Get many documents',
      },
      {
        name: 'Get Templates',
        value: 'getTemplates',
        description: 'Get document templates',
        action: 'Get document templates',
      },
      {
        name: 'Submit',
        value: 'submit',
        description: 'Submit a document',
        action: 'Submit a document',
      },
    ],
    default: 'getAll',
  },
];

export const documentFields: INodeProperties[] = [
  // Document ID for get, submit operations
  {
    displayName: 'Document ID',
    name: 'documentId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['get', 'submit'],
      },
    },
    description: 'The ID of the document',
  },

  // Create document fields
  {
    displayName: 'Template ID',
    name: 'documentTemplateId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['create'],
      },
    },
    description: 'The ID of the document template to use',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Driver ID',
        name: 'driverId',
        type: 'string',
        default: '',
        description: 'ID of the associated driver',
      },
      {
        displayName: 'Vehicle ID',
        name: 'vehicleId',
        type: 'string',
        default: '',
        description: 'ID of the associated vehicle',
      },
      {
        displayName: 'Dispatch Job ID',
        name: 'dispatchJobId',
        type: 'string',
        default: '',
        description: 'ID of the linked dispatch job',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Notes for the document',
      },
    ],
  },

  // Document fields
  {
    displayName: 'Fields',
    name: 'fields',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['create'],
      },
    },
    options: [
      {
        name: 'fieldValues',
        displayName: 'Field',
        values: [
          {
            displayName: 'Field Label',
            name: 'label',
            type: 'string',
            default: '',
            description: 'The label of the field',
          },
          {
            displayName: 'Value Type',
            name: 'valueType',
            type: 'options',
            options: [
              { name: 'String', value: 'string' },
              { name: 'Number', value: 'number' },
              { name: 'Date/Time', value: 'datetime' },
              { name: 'Boolean', value: 'boolean' },
              { name: 'Signature', value: 'signature' },
            ],
            default: 'string',
            description: 'The type of value',
          },
          {
            displayName: 'String Value',
            name: 'stringValue',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                valueType: ['string'],
              },
            },
            description: 'The string value',
          },
          {
            displayName: 'Number Value',
            name: 'numberValue',
            type: 'number',
            default: 0,
            displayOptions: {
              show: {
                valueType: ['number'],
              },
            },
            description: 'The number value',
          },
          {
            displayName: 'DateTime Value',
            name: 'dateTimeValue',
            type: 'dateTime',
            default: '',
            displayOptions: {
              show: {
                valueType: ['datetime'],
              },
            },
            description: 'The datetime value',
          },
          {
            displayName: 'Boolean Value',
            name: 'booleanValue',
            type: 'boolean',
            default: false,
            displayOptions: {
              show: {
                valueType: ['boolean'],
              },
            },
            description: 'The boolean value',
          },
        ],
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
        resource: ['document'],
        operation: ['getAll', 'getTemplates'],
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
        resource: ['document'],
        operation: ['getAll', 'getTemplates'],
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
        resource: ['document'],
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
        description: 'Filter documents created after this time',
      },
      {
        displayName: 'End Time',
        name: 'endTime',
        type: 'dateTime',
        default: '',
        description: 'Filter documents created before this time',
      },
      {
        displayName: 'Document State',
        name: 'state',
        type: 'options',
        options: [
          { name: 'Required', value: 'required' },
          { name: 'Submitted', value: 'submitted' },
          { name: 'Archived', value: 'archived' },
        ],
        default: 'submitted',
        description: 'Filter by document state',
      },
    ],
  },
];

export async function executeDocumentOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[] = {};

  switch (operation) {
    case 'create': {
      const documentTemplateId = this.getNodeParameter('documentTemplateId', i) as string;
      const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
      const fieldsData = this.getNodeParameter('fields', i) as IDataObject;

      const body: IDataObject = {
        documentTemplateId,
      };

      // Add additional fields
      if (additionalFields.driverId) body.driverId = additionalFields.driverId;
      if (additionalFields.vehicleId) body.vehicleId = additionalFields.vehicleId;
      if (additionalFields.dispatchJobId) body.dispatchJobId = additionalFields.dispatchJobId;
      if (additionalFields.notes) body.notes = additionalFields.notes;

      // Process field values
      if (fieldsData.fieldValues && Array.isArray(fieldsData.fieldValues)) {
        body.fields = (fieldsData.fieldValues as IDataObject[]).map((field) => {
          const fieldObj: IDataObject = {
            label: field.label,
          };

          switch (field.valueType) {
            case 'string':
              fieldObj.stringValue = field.stringValue;
              break;
            case 'number':
              fieldObj.numberValue = field.numberValue;
              break;
            case 'datetime':
              fieldObj.dateTimeValue = new Date(field.dateTimeValue as string).toISOString();
              break;
            case 'boolean':
              fieldObj.booleanValue = field.booleanValue;
              break;
          }

          return fieldObj;
        });
      }

      const response = await samsaraApiRequest.call(this, 'POST', '/fleet/documents', body);
      responseData = response.data as IDataObject;
      break;
    }

    case 'get': {
      const documentId = this.getNodeParameter('documentId', i) as string;
      const response = await samsaraApiRequest.call(
        this,
        'GET',
        `/fleet/documents/${documentId}`,
      );
      responseData = response.data as IDataObject;
      break;
    }

    case 'getAll': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;

      const query: IDataObject = {};
      if (filters.driverIds) query.driverIds = filters.driverIds;
      if (filters.vehicleIds) query.vehicleIds = filters.vehicleIds;
      if (filters.state) query.state = filters.state;

      if (filters.startTime || filters.endTime) {
        const timeRange = formatTimeRange(
          filters.startTime as string,
          filters.endTime as string,
        );
        Object.assign(query, timeRange);
      }

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/documents',
          {},
          query,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/documents',
          {},
          query,
          limit,
        );
      }
      break;
    }

    case 'getTemplates': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;

      if (returnAll) {
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/documents/templates',
          {},
          {},
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        responseData = await samsaraApiRequestAllItems.call(
          this,
          'GET',
          '/fleet/documents/templates',
          {},
          {},
          limit,
        );
      }
      break;
    }

    case 'submit': {
      const documentId = this.getNodeParameter('documentId', i) as string;
      const response = await samsaraApiRequest.call(
        this,
        'PATCH',
        `/fleet/documents/${documentId}`,
        { state: 'submitted' },
      );
      responseData = response.data as IDataObject;
      break;
    }
  }

  return responseData;
}
