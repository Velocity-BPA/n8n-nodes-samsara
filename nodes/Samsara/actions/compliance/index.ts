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

export const complianceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['compliance'],
			},
		},
		options: [
			{
				name: 'Create DVIR',
				value: 'createDvir',
				description: 'Create a new Driver Vehicle Inspection Report',
				action: 'Create a DVIR',
			},
			{
				name: 'Get DVIR Logs',
				value: 'getDvirLogs',
				description: 'Get DVIR inspection logs',
				action: 'Get DVIR logs',
			},
			{
				name: 'Get HOS Logs',
				value: 'getHosLogs',
				description: 'Get Hours of Service logs for drivers',
				action: 'Get HOS logs',
			},
			{
				name: 'Get HOS Violations',
				value: 'getHosViolations',
				description: 'Get Hours of Service violations',
				action: 'Get HOS violations',
			},
			{
				name: 'Get Unassigned HOS',
				value: 'getUnassignedHos',
				description: 'Get unassigned HOS driving segments',
				action: 'Get unassigned HOS',
			},
		],
		default: 'getHosLogs',
	},
];

export const complianceFields: INodeProperties[] = [
	// ----------------------------------
	//         getHosLogs
	// ----------------------------------
	{
		displayName: 'Start Time',
		name: 'startTime',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['compliance'],
				operation: ['getHosLogs', 'getHosViolations', 'getDvirLogs', 'getUnassignedHos'],
			},
		},
		default: '',
		description: 'Start of the time range for logs',
	},
	{
		displayName: 'End Time',
		name: 'endTime',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['compliance'],
				operation: ['getHosLogs', 'getHosViolations', 'getDvirLogs', 'getUnassignedHos'],
			},
		},
		default: '',
		description: 'End of the time range for logs',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['compliance'],
				operation: ['getHosLogs'],
			},
		},
		options: [
			{
				displayName: 'Driver IDs',
				name: 'driverIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of driver IDs to filter by',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 512,
				},
				default: 100,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Log Types',
				name: 'logTypes',
				type: 'multiOptions',
				options: [
					{ name: 'Driving', value: 'driving' },
					{ name: 'On Duty', value: 'onDuty' },
					{ name: 'Off Duty', value: 'offDuty' },
					{ name: 'Sleeper Berth', value: 'sleeperBerth' },
					{ name: 'Yard Move', value: 'yardMove' },
					{ name: 'Personal Conveyance', value: 'personalConveyance' },
				],
				default: [],
				description: 'Filter by specific log types',
			},
			{
				displayName: 'Tag IDs',
				name: 'tagIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tag IDs to filter by',
			},
		],
	},
	// ----------------------------------
	//         getHosViolations
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['compliance'],
				operation: ['getHosViolations'],
			},
		},
		options: [
			{
				displayName: 'Driver IDs',
				name: 'driverIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of driver IDs to filter by',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 512,
				},
				default: 100,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Violation Types',
				name: 'violationTypes',
				type: 'multiOptions',
				options: [
					{ name: '11 Hour Driving', value: 'elevenHourDriving' },
					{ name: '14 Hour Shift', value: 'fourteenHourShift' },
					{ name: '30 Minute Break', value: 'thirtyMinuteBreak' },
					{ name: '60 Hour Limit', value: 'sixtyHourLimit' },
					{ name: '70 Hour Limit', value: 'seventyHourLimit' },
					{ name: '8 Hour Sleeper Berth', value: 'eightHourSleeperBerth' },
				],
				default: [],
				description: 'Filter by specific violation types',
			},
			{
				displayName: 'Tag IDs',
				name: 'tagIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tag IDs to filter by',
			},
		],
	},
	// ----------------------------------
	//         getDvirLogs
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['compliance'],
				operation: ['getDvirLogs'],
			},
		},
		options: [
			{
				displayName: 'Driver IDs',
				name: 'driverIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of driver IDs to filter by',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 512,
				},
				default: 100,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Vehicle IDs',
				name: 'vehicleIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of vehicle IDs to filter by',
			},
			{
				displayName: 'Inspection Type',
				name: 'inspectionType',
				type: 'options',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Pre-Trip', value: 'preTrip' },
					{ name: 'Post-Trip', value: 'postTrip' },
				],
				default: 'all',
				description: 'Filter by inspection type',
			},
			{
				displayName: 'Tag IDs',
				name: 'tagIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tag IDs to filter by',
			},
		],
	},
	// ----------------------------------
	//         createDvir
	// ----------------------------------
	{
		displayName: 'Vehicle ID',
		name: 'vehicleId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['compliance'],
				operation: ['createDvir'],
			},
		},
		default: '',
		description: 'ID of the vehicle for the inspection',
	},
	{
		displayName: 'Inspection Type',
		name: 'inspectionType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['compliance'],
				operation: ['createDvir'],
			},
		},
		options: [
			{ name: 'Pre-Trip', value: 'preTrip' },
			{ name: 'Post-Trip', value: 'postTrip' },
		],
		default: 'preTrip',
		description: 'Type of inspection',
	},
	{
		displayName: 'Safe to Operate',
		name: 'safeToOperate',
		type: 'boolean',
		required: true,
		displayOptions: {
			show: {
				resource: ['compliance'],
				operation: ['createDvir'],
			},
		},
		default: true,
		description: 'Whether the vehicle is safe to operate',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['compliance'],
				operation: ['createDvir'],
			},
		},
		options: [
			{
				displayName: 'Driver ID',
				name: 'driverId',
				type: 'string',
				default: '',
				description: 'ID of the driver performing the inspection',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Location where inspection was performed',
			},
			{
				displayName: 'Odometer (Miles)',
				name: 'odometerMiles',
				type: 'number',
				default: 0,
				description: 'Odometer reading in miles',
			},
			{
				displayName: 'Remarks',
				name: 'remarks',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'General remarks for the inspection',
			},
			{
				displayName: 'Trailer IDs',
				name: 'trailerIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of trailer IDs included in inspection',
			},
			{
				displayName: 'Defects',
				name: 'defects',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'defectValues',
						displayName: 'Defect',
						values: [
							{
								displayName: 'Defect Type',
								name: 'defectType',
								type: 'string',
								default: '',
								description: 'Type of defect found',
							},
							{
								displayName: 'Comment',
								name: 'comment',
								type: 'string',
								default: '',
								description: 'Additional details about the defect',
							},
							{
								displayName: 'Is Major',
								name: 'isMajor',
								type: 'boolean',
								default: false,
								description: 'Whether this is a major defect',
							},
						],
					},
				],
			},
		],
	},
	// ----------------------------------
	//         getUnassignedHos
	// ----------------------------------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['compliance'],
				operation: ['getUnassignedHos'],
			},
		},
		options: [
			{
				displayName: 'Vehicle IDs',
				name: 'vehicleIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of vehicle IDs to filter by',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 512,
				},
				default: 100,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Tag IDs',
				name: 'tagIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tag IDs to filter by',
			},
		],
	},
];

export async function executeComplianceOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<INodeExecutionData[]> {
	let responseData: IDataObject | IDataObject[] = {};

	if (operation === 'getHosLogs') {
		const startTime = this.getNodeParameter('startTime', i) as string;
		const endTime = this.getNodeParameter('endTime', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

		const qs: IDataObject = {
			startTime: new Date(startTime).toISOString(),
			endTime: new Date(endTime).toISOString(),
		};

		if (additionalFields.driverIds) {
			qs.driverIds = (additionalFields.driverIds as string).split(',').map((id) => id.trim());
		}

		if (additionalFields.tagIds) {
			qs.tagIds = (additionalFields.tagIds as string).split(',').map((id) => id.trim());
		}

		if (additionalFields.logTypes && (additionalFields.logTypes as string[]).length > 0) {
			qs.logTypes = additionalFields.logTypes;
		}

		const returnAll = additionalFields.returnAll as boolean;

		if (returnAll) {
			responseData = await samsaraApiRequestAllItems.call(this, 'GET', '/fleet/hos/logs', {}, qs);
		} else {
			const limit = (additionalFields.limit as number) || 100;
			qs.limit = limit;
			const response = await samsaraApiRequest.call(this, 'GET', '/fleet/hos/logs', {}, qs);
			responseData = (response.data || []) as IDataObject[];
		}
	}

	if (operation === 'getHosViolations') {
		const startTime = this.getNodeParameter('startTime', i) as string;
		const endTime = this.getNodeParameter('endTime', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

		const qs: IDataObject = {
			startTime: new Date(startTime).toISOString(),
			endTime: new Date(endTime).toISOString(),
		};

		if (additionalFields.driverIds) {
			qs.driverIds = (additionalFields.driverIds as string).split(',').map((id) => id.trim());
		}

		if (additionalFields.tagIds) {
			qs.tagIds = (additionalFields.tagIds as string).split(',').map((id) => id.trim());
		}

		if (additionalFields.violationTypes && (additionalFields.violationTypes as string[]).length > 0) {
			qs.violationTypes = additionalFields.violationTypes;
		}

		const returnAll = additionalFields.returnAll as boolean;

		if (returnAll) {
			responseData = await samsaraApiRequestAllItems.call(this, 'GET', '/fleet/hos/violations', {}, qs);
		} else {
			const limit = (additionalFields.limit as number) || 100;
			qs.limit = limit;
			const response = await samsaraApiRequest.call(this, 'GET', '/fleet/hos/violations', {}, qs);
			responseData = (response.data || []) as IDataObject[];
		}
	}

	if (operation === 'getDvirLogs') {
		const startTime = this.getNodeParameter('startTime', i) as string;
		const endTime = this.getNodeParameter('endTime', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

		const qs: IDataObject = {
			startTime: new Date(startTime).toISOString(),
			endTime: new Date(endTime).toISOString(),
		};

		if (additionalFields.driverIds) {
			qs.driverIds = (additionalFields.driverIds as string).split(',').map((id) => id.trim());
		}

		if (additionalFields.vehicleIds) {
			qs.vehicleIds = (additionalFields.vehicleIds as string).split(',').map((id) => id.trim());
		}

		if (additionalFields.tagIds) {
			qs.tagIds = (additionalFields.tagIds as string).split(',').map((id) => id.trim());
		}

		if (additionalFields.inspectionType && additionalFields.inspectionType !== 'all') {
			qs.inspectionType = additionalFields.inspectionType;
		}

		const returnAll = additionalFields.returnAll as boolean;

		if (returnAll) {
			responseData = await samsaraApiRequestAllItems.call(this, 'GET', '/fleet/dvirs', {}, qs);
		} else {
			const limit = (additionalFields.limit as number) || 100;
			qs.limit = limit;
			const response = await samsaraApiRequest.call(this, 'GET', '/fleet/dvirs', {}, qs);
			responseData = (response.data || []) as IDataObject[];
		}
	}

	if (operation === 'createDvir') {
		const vehicleId = this.getNodeParameter('vehicleId', i) as string;
		const inspectionType = this.getNodeParameter('inspectionType', i) as string;
		const safeToOperate = this.getNodeParameter('safeToOperate', i) as boolean;
		const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

		const body: IDataObject = {
			vehicleId,
			inspectionType,
			safeToOperate,
		};

		if (additionalFields.driverId) {
			body.driverId = additionalFields.driverId;
		}

		if (additionalFields.location) {
			body.location = additionalFields.location;
		}

		if (additionalFields.odometerMiles) {
			body.odometerMiles = additionalFields.odometerMiles;
		}

		if (additionalFields.remarks) {
			body.remarks = additionalFields.remarks;
		}

		if (additionalFields.trailerIds) {
			body.trailerIds = (additionalFields.trailerIds as string).split(',').map((id) => id.trim());
		}

		if (additionalFields.defects) {
			const defectsData = additionalFields.defects as IDataObject;
			if (defectsData.defectValues && (defectsData.defectValues as IDataObject[]).length > 0) {
				body.defects = (defectsData.defectValues as IDataObject[]).map((defect) => ({
					defectType: defect.defectType,
					comment: defect.comment,
					isMajor: defect.isMajor,
				}));
			}
		}

		responseData = (await samsaraApiRequest.call(this, 'POST', '/fleet/dvirs', body)).data as IDataObject || {};
	}

	if (operation === 'getUnassignedHos') {
		const startTime = this.getNodeParameter('startTime', i) as string;
		const endTime = this.getNodeParameter('endTime', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

		const qs: IDataObject = {
			startTime: new Date(startTime).toISOString(),
			endTime: new Date(endTime).toISOString(),
		};

		if (additionalFields.vehicleIds) {
			qs.vehicleIds = (additionalFields.vehicleIds as string).split(',').map((id) => id.trim());
		}

		if (additionalFields.tagIds) {
			qs.tagIds = (additionalFields.tagIds as string).split(',').map((id) => id.trim());
		}

		const returnAll = additionalFields.returnAll as boolean;

		if (returnAll) {
			responseData = await samsaraApiRequestAllItems.call(this, 'GET', '/fleet/hos/unassigned', {}, qs);
		} else {
			const limit = (additionalFields.limit as number) || 100;
			qs.limit = limit;
			const response = await samsaraApiRequest.call(this, 'GET', '/fleet/hos/unassigned', {}, qs);
			responseData = (response.data || []) as IDataObject[];
		}
	}

	const executionData = this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: i } },
	);

	return executionData;
}
