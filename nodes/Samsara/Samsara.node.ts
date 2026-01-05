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
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	IDataObject,
} from 'n8n-workflow';

import { logLicenseNotice } from './utils';

// Vehicle
import { vehicleOperations, vehicleFields, executeVehicleOperation } from './actions/vehicle';
// Driver
import { driverOperations, driverFields, executeDriverOperation } from './actions/driver';
// Route
import { routeOperations, routeFields, executeRouteOperation } from './actions/route';
// Asset
import { assetOperations, assetFields, executeAssetOperation } from './actions/asset';
// Tag
import { tagOperations, tagFields, executeTagOperation } from './actions/tag';
// Address
import { addressOperations, addressFields, executeAddressOperation } from './actions/address';
// Document
import { documentOperations, documentFields, executeDocumentOperation } from './actions/document';
// Sensor
import { sensorOperations, sensorFields, executeSensorOperation } from './actions/sensor';
// Safety
import { safetyOperations, safetyFields, executeSafetyOperation } from './actions/safety';
// Compliance
import { complianceOperations, complianceFields, executeComplianceOperation } from './actions/compliance';
// Webhook
import { webhookOperations, webhookFields, executeWebhookOperation } from './actions/webhook';

// Helper to construct execution data from response
function constructExecutionData(
	executeFns: IExecuteFunctions,
	responseData: IDataObject | IDataObject[],
	itemIndex: number,
): INodeExecutionData[] {
	const items = Array.isArray(responseData) ? responseData : [responseData];
	return executeFns.helpers.constructExecutionMetaData(
		executeFns.helpers.returnJsonArray(items),
		{ itemData: { item: itemIndex } },
	);
}

export class Samsara implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Samsara',
		name: 'samsara',
		icon: 'file:samsara.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Samsara API for fleet management, IoT, and telematics',
		defaults: {
			name: 'Samsara',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'samsaraApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Address',
						value: 'address',
						description: 'Manage location addresses and geofences',
					},
					{
						name: 'Asset',
						value: 'asset',
						description: 'Manage equipment and assets',
					},
					{
						name: 'Compliance',
						value: 'compliance',
						description: 'Access HOS logs, violations, and DVIR inspections',
					},
					{
						name: 'Document',
						value: 'document',
						description: 'Manage driver documents',
					},
					{
						name: 'Driver',
						value: 'driver',
						description: 'Manage drivers and their data',
					},
					{
						name: 'Route',
						value: 'route',
						description: 'Manage routes and dispatching',
					},
					{
						name: 'Safety',
						value: 'safety',
						description: 'Access safety events and scores',
					},
					{
						name: 'Sensor',
						value: 'sensor',
						description: 'Access sensor and gateway data',
					},
					{
						name: 'Tag',
						value: 'tag',
						description: 'Manage organizational tags',
					},
					{
						name: 'Vehicle',
						value: 'vehicle',
						description: 'Manage vehicles and telematics data',
					},
					{
						name: 'Webhook',
						value: 'webhook',
						description: 'Manage webhook subscriptions',
					},
				],
				default: 'vehicle',
			},
			// Vehicle
			...vehicleOperations,
			...vehicleFields,
			// Driver
			...driverOperations,
			...driverFields,
			// Route
			...routeOperations,
			...routeFields,
			// Asset
			...assetOperations,
			...assetFields,
			// Tag
			...tagOperations,
			...tagFields,
			// Address
			...addressOperations,
			...addressFields,
			// Document
			...documentOperations,
			...documentFields,
			// Sensor
			...sensorOperations,
			...sensorFields,
			// Safety
			...safetyOperations,
			...safetyFields,
			// Compliance
			...complianceOperations,
			...complianceFields,
			// Webhook
			...webhookOperations,
			...webhookFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Log license notice once per node load
		logLicenseNotice();

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[] | INodeExecutionData[] = {};

				switch (resource) {
					case 'vehicle':
						responseData = await executeVehicleOperation.call(this, operation, i);
						break;
					case 'driver':
						responseData = await executeDriverOperation.call(this, operation, i);
						break;
					case 'route':
						responseData = await executeRouteOperation.call(this, operation, i);
						break;
					case 'asset':
						responseData = await executeAssetOperation.call(this, operation, i);
						break;
					case 'tag':
						responseData = await executeTagOperation.call(this, operation, i);
						break;
					case 'address':
						responseData = await executeAddressOperation.call(this, operation, i);
						break;
					case 'document':
						responseData = await executeDocumentOperation.call(this, operation, i);
						break;
					case 'sensor':
						responseData = await executeSensorOperation.call(this, operation, i);
						break;
					case 'safety':
						responseData = await executeSafetyOperation.call(this, operation, i);
						break;
					case 'compliance':
						responseData = await executeComplianceOperation.call(this, operation, i);
						break;
					case 'webhook':
						responseData = await executeWebhookOperation.call(this, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				// Handle both IDataObject[] and INodeExecutionData[] returns
				if (Array.isArray(responseData) && responseData.length > 0 && 'json' in responseData[0]) {
					// Already INodeExecutionData[]
					returnData.push(...(responseData as INodeExecutionData[]));
				} else {
					// IDataObject or IDataObject[]
					const executionData = constructExecutionData(
						this,
						responseData as IDataObject | IDataObject[],
						i,
					);
					returnData.push(...executionData);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
