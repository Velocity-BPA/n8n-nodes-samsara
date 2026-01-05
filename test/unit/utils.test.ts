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

import {
	formatGeofence,
	formatStopObject,
	statsTypeOptions,
	safetyEventTypeOptions,
	sensorDataSeriesOptions,
	logLicenseNotice,
} from '../../nodes/Samsara/utils';

describe('Samsara Utils', () => {
	describe('formatGeofence', () => {
		it('should format circle geofence correctly', () => {
			const geofence = {
				type: 'circle',
				latitude: 37.7749,
				longitude: -122.4194,
				radiusMeters: 500,
			};

			const result = formatGeofence(geofence);

			expect(result).toEqual({
				type: 'circle',
				circle: {
					latitude: 37.7749,
					longitude: -122.4194,
					radiusMeters: 500,
				},
			});
		});

		it('should format polygon geofence correctly', () => {
			const geofence = {
				type: 'polygon',
				vertices: [
					{ latitude: 37.7749, longitude: -122.4194 },
					{ latitude: 37.7850, longitude: -122.4194 },
					{ latitude: 37.7850, longitude: -122.4094 },
				],
			};

			const result = formatGeofence(geofence);

			expect(result).toHaveProperty('polygon');
			expect(result.type).toBe('polygon');
			const polygon = result.polygon as { vertices: unknown[] };
			expect(polygon.vertices).toHaveLength(3);
		});

		it('should default to circle type when not specified', () => {
			const geofence = {
				latitude: 37.7749,
				longitude: -122.4194,
			};

			const result = formatGeofence(geofence);

			expect(result.type).toBe('circle');
			expect(result).toHaveProperty('circle');
		});

		it('should return empty object for null geofence', () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = formatGeofence(null as any);
			expect(result).toEqual({});
		});

		it('should use default radius for circle without radiusMeters', () => {
			const geofence = {
				type: 'circle',
				latitude: 37.7749,
				longitude: -122.4194,
			};

			const result = formatGeofence(geofence);
			const circle = result.circle as { radiusMeters: number };
			expect(circle.radiusMeters).toBe(100);
		});
	});

	describe('formatStopObject', () => {
		it('should format stop with address ID', () => {
			const stop = {
				name: 'Test Stop',
				addressId: 'addr123',
				notes: 'Delivery notes',
			};

			const result = formatStopObject(stop);

			expect(result.name).toBe('Test Stop');
			expect(result.addressId).toBe('addr123');
			expect(result.notes).toBe('Delivery notes');
		});

		it('should format stop with coordinates', () => {
			const stop = {
				name: 'GPS Stop',
				latitude: 37.7749,
				longitude: -122.4194,
			};

			const result = formatStopObject(stop);

			expect(result.name).toBe('GPS Stop');
			expect(result.latitude).toBe(37.7749);
			expect(result.longitude).toBe(-122.4194);
		});

		it('should prefer addressId over coordinates when both provided', () => {
			const stop = {
				name: 'Test Stop',
				addressId: 'addr123',
				latitude: 37.7749,
				longitude: -122.4194,
			};

			const result = formatStopObject(stop);

			expect(result.addressId).toBe('addr123');
			expect(result.latitude).toBeUndefined();
			expect(result.longitude).toBeUndefined();
		});

		it('should format scheduled times as ISO strings', () => {
			const stop = {
				name: 'Test Stop',
				addressId: 'addr123',
				scheduledArrivalTime: '2024-01-01T10:00:00Z',
				scheduledDepartureTime: '2024-01-01T11:00:00Z',
			};

			const result = formatStopObject(stop);

			expect(result.scheduledArrivalTime).toBe('2024-01-01T10:00:00.000Z');
			expect(result.scheduledDepartureTime).toBe('2024-01-01T11:00:00.000Z');
		});

		it('should handle minimal stop data', () => {
			const stop = {
				name: 'Simple Stop',
			};

			const result = formatStopObject(stop);

			expect(result).toEqual({ name: 'Simple Stop' });
		});
	});

	describe('Option Arrays', () => {
		it('should have valid statsTypeOptions', () => {
			expect(statsTypeOptions).toBeInstanceOf(Array);
			expect(statsTypeOptions.length).toBeGreaterThan(0);

			statsTypeOptions.forEach((option) => {
				expect(option).toHaveProperty('name');
				expect(option).toHaveProperty('value');
				expect(typeof option.name).toBe('string');
				expect(typeof option.value).toBe('string');
			});

			const values = statsTypeOptions.map((o) => o.value);
			expect(values).toContain('gps');
			expect(values).toContain('fuelPercent');
			expect(values).toContain('engineRpm');
		});

		it('should have valid safetyEventTypeOptions', () => {
			expect(safetyEventTypeOptions).toBeInstanceOf(Array);
			expect(safetyEventTypeOptions.length).toBeGreaterThan(0);

			safetyEventTypeOptions.forEach((option) => {
				expect(option).toHaveProperty('name');
				expect(option).toHaveProperty('value');
			});

			const values = safetyEventTypeOptions.map((o) => o.value);
			expect(values).toContain('harshAcceleration');
			expect(values).toContain('speeding');
			expect(values).toContain('crash');
		});

		it('should have valid sensorDataSeriesOptions', () => {
			expect(sensorDataSeriesOptions).toBeInstanceOf(Array);
			expect(sensorDataSeriesOptions.length).toBeGreaterThan(0);

			sensorDataSeriesOptions.forEach((option) => {
				expect(option).toHaveProperty('name');
				expect(option).toHaveProperty('value');
			});

			const values = sensorDataSeriesOptions.map((o) => o.value);
			expect(values).toContain('temperature');
			expect(values).toContain('humidity');
		});
	});

	describe('License Notice', () => {
		beforeEach(() => {
			// Reset the global flag before each test
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(global as any).__samsaraLicenseLogged = false;
		});

		it('should have logLicenseNotice function', () => {
			expect(typeof logLicenseNotice).toBe('function');
		});

		it('should only log once per session', () => {
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

			logLicenseNotice();
			logLicenseNotice();
			logLicenseNotice();

			// Should only have been called once
			expect(consoleSpy).toHaveBeenCalledTimes(1);

			consoleSpy.mockRestore();
		});

		it('should include licensing information in the notice', () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(global as any).__samsaraLicenseLogged = false;
			const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

			logLicenseNotice();

			expect(consoleSpy).toHaveBeenCalled();
			const message = consoleSpy.mock.calls[0][0];
			expect(message).toContain('Velocity BPA');
			expect(message).toContain('Business Source License');

			consoleSpy.mockRestore();
		});
	});
});
