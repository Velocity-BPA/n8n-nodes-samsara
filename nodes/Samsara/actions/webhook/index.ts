/**
 * [Velocity BPA Licensing Notice]
 *
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 *
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 *
 * For licensing information, visit https://velobpa.com/licensing
 * or contact licensing@velobpa.com.
 */

import type {
	INodeProperties,
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
} from 'n8n-workflow';
import { samsaraApiRequest, samsaraApiRequestAllItems } from '../../transport';

export const webhookEventTypeOptions = [
	{ name: 'Address Created', value: 'AddressCreated' },
	{ name: 'Address Deleted', value: 'AddressDeleted' },
	{ name: 'Address Updated', value: 'AddressUpdated' },
	{ name: 'Document Submitted', value: 'DocumentSubmitted' },
	{ name: 'Driver Created', value: 'DriverCreated' },
	{ name: 'Driver Updated', value: 'DriverUpdated' },
	{ name: 'DVIR Submitted', value: 'DvirSubmitted' },
	{ name: 'Geofence Entry', value: 'GeofenceEntry' },
	{ name: 'Geofence Exit', value: 'GeofenceExit' },
	{ name: 'Route Completed', value: 'RouteCompleted' },
	{ name: 'Route Started', value: 'RouteStarted' },
	{ name: 'Route Stop Arrival', value: 'RouteStopArrival' },
	{ name: 'Route Stop Departure', value: 'RouteStopDeparture' },
	{ name: 'Safety Event', value: 'SafetyEvent' },
	{ name: 'Vehicle Created', value: 'VehicleCreated' },
	{ name: 'Vehicle Updated', value: 'VehicleUpdated' },
];

export const webhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new webhook',
				action: 'Create a webhook',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a webhook',
				action: 'Delete a webhook',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a webhook by ID',
				action: 'Get a webhook',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get all webhooks',
				action: 'Get many webhooks',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a webhook',
				action: 'Update a webhook',
			},
		],
		default: 'getAll',
	},
];

export const webhookFields: INodeProperties[] = [
	// ----------------------------------
	//         create
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the webhook',
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'https://example.com/webhook',
		description: 'URL to receive webhook events',
	},
	{
		displayName: 'Event Types',
		name: 'eventTypes',
		type: 'multiOptions',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		options: webhookEventTypeOptions,
		default: [],
		description: 'Event types to subscribe to',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Custom Headers',
				name: 'customHeaders',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Custom headers to include with webhook requests',
				options: [
					{
						name: 'headerValues',
						displayName: 'Header',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Header name',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Header value',
							},
						],
					},
				],
			},
			{
				displayName: 'Secret Token',
				name: 'secretToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Secret token for webhook signature verification',
			},
			{
				displayName: 'Tag IDs',
				name: 'tagIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tag IDs to filter events',
			},
			{
				displayName: 'Vehicle IDs',
				name: 'vehicleIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of vehicle IDs to filter events',
			},
			{
				displayName: 'Driver IDs',
				name: 'driverIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of driver IDs to filter events',
			},
		],
	},
	// ----------------------------------
	//         get / delete
	// ----------------------------------
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['get', 'delete', 'update'],
			},
		},
		default: '',
		description: 'ID of the webhook',
	},
	// ----------------------------------
	//         getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 512,
		},
		default: 100,
		description: 'Max number of results to return',
	},
	// ----------------------------------
	//         update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the webhook',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'URL to receive webhook events',
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				options: webhookEventTypeOptions,
				default: [],
				description: 'Event types to subscribe to',
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the webhook is enabled',
			},
			{
				displayName: 'Custom Headers',
				name: 'customHeaders',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Custom headers to include with webhook requests',
				options: [
					{
						name: 'headerValues',
						displayName: 'Header',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Header name',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Header value',
							},
						],
					},
				],
			},
			{
				displayName: 'Secret Token',
				name: 'secretToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Secret token for webhook signature verification',
			},
			{
				displayName: 'Tag IDs',
				name: 'tagIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tag IDs to filter events',
			},
			{
				displayName: 'Vehicle IDs',
				name: 'vehicleIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of vehicle IDs to filter events',
			},
			{
				displayName: 'Driver IDs',
				name: 'driverIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of driver IDs to filter events',
			},
		],
	},
];

export async function executeWebhookOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[] = {};

	if (operation === 'create') {
		const name = this.getNodeParameter('name', i) as string;
		const url = this.getNodeParameter('url', i) as string;
		const eventTypes = this.getNodeParameter('eventTypes', i) as string[];
		const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

		const body: IDataObject = {
			name,
			url,
			eventTypes,
		};

		if (additionalFields.secretToken) {
			body.secretToken = additionalFields.secretToken;
		}

		if (additionalFields.tagIds) {
			body.tagIds = (additionalFields.tagIds as string).split(',').map((id) => id.trim());
		}

		if (additionalFields.vehicleIds) {
			body.vehicleIds = (additionalFields.vehicleIds as string).split(',').map((id) => id.trim());
		}

		if (additionalFields.driverIds) {
			body.driverIds = (additionalFields.driverIds as string).split(',').map((id) => id.trim());
		}

		if (additionalFields.customHeaders) {
			const headersData = additionalFields.customHeaders as IDataObject;
			if (headersData.headerValues && (headersData.headerValues as IDataObject[]).length > 0) {
				const headers: IDataObject = {};
				for (const header of headersData.headerValues as IDataObject[]) {
					headers[header.key as string] = header.value;
				}
				body.customHeaders = headers;
			}
		}

		responseData = (await samsaraApiRequest.call(this, 'POST', '/webhooks', body)).data as IDataObject || {};
	}

	if (operation === 'get') {
		const webhookId = this.getNodeParameter('webhookId', i) as string;
		responseData = (await samsaraApiRequest.call(this, 'GET', `/webhooks/${webhookId}`)).data as IDataObject || {};
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const qs: IDataObject = {};

		if (returnAll) {
			responseData = await samsaraApiRequestAllItems.call(this, 'GET', '/webhooks', {}, qs);
		} else {
			const limit = this.getNodeParameter('limit', i) as number;
			qs.limit = limit;
			const response = await samsaraApiRequest.call(this, 'GET', '/webhooks', {}, qs);
			responseData = (response.data || []) as IDataObject[];
		}
	}

	if (operation === 'update') {
		const webhookId = this.getNodeParameter('webhookId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

		const body: IDataObject = {};

		if (updateFields.name) {
			body.name = updateFields.name;
		}

		if (updateFields.url) {
			body.url = updateFields.url;
		}

		if (updateFields.eventTypes && (updateFields.eventTypes as string[]).length > 0) {
			body.eventTypes = updateFields.eventTypes;
		}

		if (updateFields.enabled !== undefined) {
			body.enabled = updateFields.enabled;
		}

		if (updateFields.secretToken) {
			body.secretToken = updateFields.secretToken;
		}

		if (updateFields.tagIds) {
			body.tagIds = (updateFields.tagIds as string).split(',').map((id) => id.trim());
		}

		if (updateFields.vehicleIds) {
			body.vehicleIds = (updateFields.vehicleIds as string).split(',').map((id) => id.trim());
		}

		if (updateFields.driverIds) {
			body.driverIds = (updateFields.driverIds as string).split(',').map((id) => id.trim());
		}

		if (updateFields.customHeaders) {
			const headersData = updateFields.customHeaders as IDataObject;
			if (headersData.headerValues && (headersData.headerValues as IDataObject[]).length > 0) {
				const headers: IDataObject = {};
				for (const header of headersData.headerValues as IDataObject[]) {
					headers[header.key as string] = header.value;
				}
				body.customHeaders = headers;
			}
		}

		responseData = (await samsaraApiRequest.call(this, 'PATCH', `/webhooks/${webhookId}`, body)).data as IDataObject || {};
	}

	if (operation === 'delete') {
		const webhookId = this.getNodeParameter('webhookId', i) as string;
		await samsaraApiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);
		responseData = { success: true, webhookId };
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: i } },
	);

	return executionData;
}
