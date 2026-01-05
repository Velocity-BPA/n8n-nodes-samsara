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
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';

import { samsaraApiRequest } from './transport';
import { logLicenseNotice } from './utils';

export class SamsaraTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Samsara Trigger',
		name: 'samsaraTrigger',
		icon: 'file:samsara.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts workflow on Samsara events via webhooks',
		defaults: {
			name: 'Samsara Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'samsaraApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				description: 'Events to trigger on',
				options: [
					{
						name: 'Address Created',
						value: 'AddressCreated',
						description: 'Triggered when a new address is created',
					},
					{
						name: 'Address Deleted',
						value: 'AddressDeleted',
						description: 'Triggered when an address is deleted',
					},
					{
						name: 'Address Updated',
						value: 'AddressUpdated',
						description: 'Triggered when an address is updated',
					},
					{
						name: 'Document Submitted',
						value: 'DocumentSubmitted',
						description: 'Triggered when a document is submitted',
					},
					{
						name: 'Driver Created',
						value: 'DriverCreated',
						description: 'Triggered when a new driver is created',
					},
					{
						name: 'Driver Updated',
						value: 'DriverUpdated',
						description: 'Triggered when a driver is updated',
					},
					{
						name: 'DVIR Submitted',
						value: 'DvirSubmitted',
						description: 'Triggered when a DVIR is submitted',
					},
					{
						name: 'Geofence Entry',
						value: 'GeofenceEntry',
						description: 'Triggered when a vehicle enters a geofence',
					},
					{
						name: 'Geofence Exit',
						value: 'GeofenceExit',
						description: 'Triggered when a vehicle exits a geofence',
					},
					{
						name: 'Route Completed',
						value: 'RouteCompleted',
						description: 'Triggered when a route is completed',
					},
					{
						name: 'Route Started',
						value: 'RouteStarted',
						description: 'Triggered when a route is started',
					},
					{
						name: 'Route Stop Arrival',
						value: 'RouteStopArrival',
						description: 'Triggered when arriving at a route stop',
					},
					{
						name: 'Route Stop Departure',
						value: 'RouteStopDeparture',
						description: 'Triggered when departing from a route stop',
					},
					{
						name: 'Safety Event',
						value: 'SafetyEvent',
						description: 'Triggered on safety events like harsh braking',
					},
					{
						name: 'Vehicle Created',
						value: 'VehicleCreated',
						description: 'Triggered when a new vehicle is created',
					},
					{
						name: 'Vehicle Updated',
						value: 'VehicleUpdated',
						description: 'Triggered when a vehicle is updated',
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
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
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				logLicenseNotice();

				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const webhookData = this.getWorkflowStaticData('node');

				// Check if webhook already exists
				if (webhookData.webhookId) {
					try {
						await samsaraApiRequest.call(
							this,
							'GET',
							`/webhooks/${webhookData.webhookId}`,
						);
						return true;
					} catch (error) {
						// Webhook doesn't exist anymore
						delete webhookData.webhookId;
						return false;
					}
				}

				// Check if a webhook with this URL exists
				try {
					const response = await samsaraApiRequest.call(this, 'GET', '/webhooks');
					const webhooks = response.data || response;

					for (const webhook of webhooks as IDataObject[]) {
						if (webhook.url === webhookUrl) {
							webhookData.webhookId = webhook.id;
							return true;
						}
					}
				} catch {
					// Continue to create webhook
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				logLicenseNotice();

				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const events = this.getNodeParameter('events') as string[];
				const options = this.getNodeParameter('options') as IDataObject;
				const webhookData = this.getWorkflowStaticData('node');

				const body: IDataObject = {
					name: `n8n Webhook - ${this.getWorkflow().name || 'Workflow'}`,
					url: webhookUrl,
					eventTypes: events,
				};

				if (options.tagIds) {
					body.tagIds = (options.tagIds as string).split(',').map((id) => id.trim());
				}

				if (options.vehicleIds) {
					body.vehicleIds = (options.vehicleIds as string).split(',').map((id) => id.trim());
				}

				if (options.driverIds) {
					body.driverIds = (options.driverIds as string).split(',').map((id) => id.trim());
				}

				try {
					const response = await samsaraApiRequest.call(this, 'POST', '/webhooks', body);
					const responseData = response.data as IDataObject | undefined;
					const webhookId = responseData?.id || (response as unknown as IDataObject).id;

					if (!webhookId) {
						throw new Error('Webhook creation did not return an ID');
					}

					webhookData.webhookId = webhookId as string;
					return true;
				} catch (error) {
					throw new Error(`Failed to create Samsara webhook: ${(error as Error).message}`);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId) {
					try {
						await samsaraApiRequest.call(
							this,
							'DELETE',
							`/webhooks/${webhookData.webhookId}`,
						);
					} catch (error) {
						// Webhook might already be deleted
						console.warn(`Failed to delete webhook: ${(error as Error).message}`);
					}

					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		logLicenseNotice();

		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;

		// Verify webhook signature if present
		const signature = req.headers['x-samsara-signature'] as string;
		if (signature) {
			// Signature verification could be implemented here
			// For now, we accept all requests from Samsara
		}

		// Handle Samsara's webhook verification ping
		if (body.eventType === 'WebhookTest' || body.type === 'test') {
			return {
				workflowData: [
					this.helpers.returnJsonArray({
						eventType: 'WebhookTest',
						message: 'Webhook verification successful',
						timestamp: new Date().toISOString(),
					}),
				],
			};
		}

		// Return the webhook payload
		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
