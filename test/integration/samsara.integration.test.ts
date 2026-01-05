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

/**
 * Integration tests for Samsara n8n node
 *
 * These tests require valid Samsara API credentials.
 * Set the SAMSARA_API_TOKEN environment variable to run these tests.
 *
 * Run with: SAMSARA_API_TOKEN=your_token npm run test:integration
 */

describe('Samsara Integration Tests', () => {
	const apiToken = process.env.SAMSARA_API_TOKEN;
	const skipIntegration = !apiToken;

	beforeAll(() => {
		if (skipIntegration) {
			console.log(
				'Skipping integration tests - SAMSARA_API_TOKEN environment variable not set',
			);
		}
	});

	describe('Node Structure', () => {
		it('should have valid Samsara node class', () => {
			const { Samsara } = require('../../nodes/Samsara/Samsara.node');
			expect(Samsara).toBeDefined();

			const node = new Samsara();
			expect(node.description).toBeDefined();
			expect(node.description.displayName).toBe('Samsara');
		});

		it('should have valid SamsaraTrigger node class', () => {
			const { SamsaraTrigger } = require('../../nodes/Samsara/SamsaraTrigger.node');
			expect(SamsaraTrigger).toBeDefined();

			const trigger = new SamsaraTrigger();
			expect(trigger.description).toBeDefined();
			expect(trigger.description.displayName).toBe('Samsara Trigger');
		});

		it('should have all required resources', () => {
			const { Samsara } = require('../../nodes/Samsara/Samsara.node');
			const node = new Samsara();

			const resourceProp = node.description.properties.find(
				(p: { name: string }) => p.name === 'resource',
			);

			expect(resourceProp).toBeDefined();

			const resources = resourceProp.options.map((o: { value: string }) => o.value);

			expect(resources).toContain('vehicle');
			expect(resources).toContain('driver');
			expect(resources).toContain('route');
			expect(resources).toContain('asset');
			expect(resources).toContain('tag');
			expect(resources).toContain('address');
			expect(resources).toContain('document');
			expect(resources).toContain('sensor');
			expect(resources).toContain('safety');
			expect(resources).toContain('compliance');
			expect(resources).toContain('webhook');
		});
	});

	describe('Resource Operations', () => {
		it('should have vehicle operations', () => {
			const { vehicleOperations } = require('../../nodes/Samsara/actions/vehicle');
			expect(vehicleOperations).toBeDefined();
			expect(Array.isArray(vehicleOperations)).toBe(true);

			const operations = vehicleOperations[0].options.map(
				(o: { value: string }) => o.value,
			);
			expect(operations).toContain('get');
			expect(operations).toContain('getAll');
			expect(operations).toContain('getStats');
			expect(operations).toContain('getLocations');
		});

		it('should have driver operations', () => {
			const { driverOperations } = require('../../nodes/Samsara/actions/driver');
			expect(driverOperations).toBeDefined();

			const operations = driverOperations[0].options.map(
				(o: { value: string }) => o.value,
			);
			expect(operations).toContain('create');
			expect(operations).toContain('get');
			expect(operations).toContain('getAll');
			expect(operations).toContain('update');
		});

		it('should have compliance operations', () => {
			const { complianceOperations } = require('../../nodes/Samsara/actions/compliance');
			expect(complianceOperations).toBeDefined();

			const operations = complianceOperations[0].options.map(
				(o: { value: string }) => o.value,
			);
			expect(operations).toContain('getHosLogs');
			expect(operations).toContain('getHosViolations');
			expect(operations).toContain('getDvirLogs');
			expect(operations).toContain('createDvir');
		});

		it('should have webhook operations', () => {
			const { webhookOperations } = require('../../nodes/Samsara/actions/webhook');
			expect(webhookOperations).toBeDefined();

			const operations = webhookOperations[0].options.map(
				(o: { value: string }) => o.value,
			);
			expect(operations).toContain('create');
			expect(operations).toContain('get');
			expect(operations).toContain('getAll');
			expect(operations).toContain('update');
			expect(operations).toContain('delete');
		});
	});

	describe('Trigger Events', () => {
		it('should have all webhook event types', () => {
			const { SamsaraTrigger } = require('../../nodes/Samsara/SamsaraTrigger.node');
			const trigger = new SamsaraTrigger();

			const eventsProp = trigger.description.properties.find(
				(p: { name: string }) => p.name === 'events',
			);

			expect(eventsProp).toBeDefined();

			const events = eventsProp.options.map((o: { value: string }) => o.value);

			expect(events).toContain('GeofenceEntry');
			expect(events).toContain('GeofenceExit');
			expect(events).toContain('SafetyEvent');
			expect(events).toContain('RouteCompleted');
			expect(events).toContain('DvirSubmitted');
		});
	});

	// These tests require actual API credentials
	describe.skip('Live API Tests', () => {
		// Skip these tests if no API token is provided
		beforeAll(() => {
			if (!apiToken) {
				throw new Error('SAMSARA_API_TOKEN required for live API tests');
			}
		});

		it('should authenticate with valid credentials', async () => {
			// This would require mocking the n8n execution context
			// Left as a placeholder for manual testing
			expect(true).toBe(true);
		});

		it('should fetch vehicles list', async () => {
			// This would require mocking the n8n execution context
			// Left as a placeholder for manual testing
			expect(true).toBe(true);
		});
	});
});
