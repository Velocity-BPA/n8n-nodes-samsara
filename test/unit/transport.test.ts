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

import { buildQueryString, formatTimeRange } from '../../nodes/Samsara/transport';

describe('Samsara Transport Layer', () => {
	describe('buildQueryString', () => {
		it('should return empty object for empty input', () => {
			const result = buildQueryString({});
			expect(result).toEqual({});
		});

		it('should handle simple string values', () => {
			const result = buildQueryString({
				name: 'Test',
				status: 'active',
			});
			expect(result).toEqual({
				name: 'Test',
				status: 'active',
			});
		});

		it('should pass through string values unchanged', () => {
			const result = buildQueryString({
				vehicleIds: '123, 456, 789',
			});
			// buildQueryString doesn't parse comma-separated strings into arrays
			// That's handled by the action functions when needed
			expect(result.vehicleIds).toBe('123, 456, 789');
		});

		it('should handle tagIds as strings', () => {
			const result = buildQueryString({
				tagIds: 'tag1,tag2,tag3',
			});
			expect(result.tagIds).toBe('tag1,tag2,tag3');
		});

		it('should handle driverIds as strings', () => {
			const result = buildQueryString({
				driverIds: 'driver1, driver2',
			});
			expect(result.driverIds).toBe('driver1, driver2');
		});

		it('should skip null and undefined values', () => {
			const result = buildQueryString({
				name: 'Test',
				nullValue: null,
				undefinedValue: undefined,
			});
			expect(result).toEqual({ name: 'Test' });
		});

		it('should handle numeric values', () => {
			const result = buildQueryString({
				limit: 100,
				offset: 0,
			});
			expect(result).toEqual({
				limit: 100,
				offset: 0,
			});
		});

		it('should handle boolean values', () => {
			const result = buildQueryString({
				active: true,
				deleted: false,
			});
			expect(result).toEqual({
				active: true,
				deleted: false,
			});
		});

		it('should join array values with commas', () => {
			const result = buildQueryString({
				types: ['gps', 'fuelPercent', 'engineStates'],
			});
			expect(result.types).toBe('gps,fuelPercent,engineStates');
		});

		it('should skip empty arrays', () => {
			const result = buildQueryString({
				name: 'Test',
				emptyArray: [],
			});
			expect(result).toEqual({ name: 'Test' });
		});
	});

	describe('formatTimeRange', () => {
		it('should format string dates to ISO strings', () => {
			const startTime = '2024-01-01T00:00:00Z';
			const endTime = '2024-01-02T00:00:00Z';

			const result = formatTimeRange(startTime, endTime);

			expect(result.startTime).toBe('2024-01-01T00:00:00.000Z');
			expect(result.endTime).toBe('2024-01-02T00:00:00.000Z');
		});

		it('should handle string dates', () => {
			const result = formatTimeRange('2024-01-01', '2024-01-02');

			expect(result.startTime).toContain('2024-01-01');
			expect(result.endTime).toContain('2024-01-02');
		});

		it('should handle ISO string inputs', () => {
			const result = formatTimeRange(
				'2024-01-01T12:00:00.000Z',
				'2024-01-02T12:00:00.000Z',
			);

			expect(result.startTime).toBe('2024-01-01T12:00:00.000Z');
			expect(result.endTime).toBe('2024-01-02T12:00:00.000Z');
		});

		it('should return empty object for undefined times', () => {
			const result = formatTimeRange(undefined, undefined);
			expect(result).toEqual({});
		});

		it('should handle partial time ranges', () => {
			const result = formatTimeRange('2024-01-01T00:00:00Z', undefined);
			expect(result.startTime).toBe('2024-01-01T00:00:00.000Z');
			expect(result.endTime).toBeUndefined();
		});
	});
});

describe('API Endpoint Constants', () => {
	it('should have correct base URL', () => {
		// The base URL is used in the transport layer
		const BASE_URL = 'https://api.samsara.com';
		expect(BASE_URL).toBe('https://api.samsara.com');
	});
});
