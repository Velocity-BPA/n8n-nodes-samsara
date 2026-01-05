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

import { SamsaraApi } from '../../credentials/SamsaraApi.credentials';

describe('Samsara Credentials', () => {
	let credentials: SamsaraApi;

	beforeEach(() => {
		credentials = new SamsaraApi();
	});

	describe('Credential Definition', () => {
		it('should have correct name', () => {
			expect(credentials.name).toBe('samsaraApi');
		});

		it('should have correct display name', () => {
			expect(credentials.displayName).toBe('Samsara API');
		});

		it('should have documentation URL', () => {
			expect(credentials.documentationUrl).toBeDefined();
			expect(typeof credentials.documentationUrl).toBe('string');
		});

		it('should have properties array', () => {
			expect(Array.isArray(credentials.properties)).toBe(true);
			expect(credentials.properties.length).toBeGreaterThan(0);
		});
	});

	describe('API Token Property', () => {
		it('should have apiToken property', () => {
			const apiTokenProp = credentials.properties.find((p) => p.name === 'apiToken');
			expect(apiTokenProp).toBeDefined();
		});

		it('should have correct apiToken configuration', () => {
			const apiTokenProp = credentials.properties.find((p) => p.name === 'apiToken');

			expect(apiTokenProp?.type).toBe('string');
			expect(apiTokenProp?.typeOptions?.password).toBe(true);
			expect(apiTokenProp?.required).toBe(true);
		});

		it('should have helpful description for apiToken', () => {
			const apiTokenProp = credentials.properties.find((p) => p.name === 'apiToken');
			expect(apiTokenProp?.description).toBeDefined();
		});
	});

	describe('Authentication Configuration', () => {
		it('should have authenticate method', () => {
			expect(credentials.authenticate).toBeDefined();
		});

		it('should configure Bearer token authentication', () => {
			const auth = credentials.authenticate;
			expect(auth).toHaveProperty('type', 'generic');
			expect(auth).toHaveProperty('properties');
		});

		it('should set Authorization header correctly', () => {
			const auth = credentials.authenticate as {
				type: string;
				properties: {
					headers: Record<string, string>;
				};
			};

			expect(auth.properties.headers).toHaveProperty('Authorization');
			expect(auth.properties.headers.Authorization).toContain('Bearer');
		});
	});

	describe('Credential Test', () => {
		it('should have test configuration', () => {
			expect(credentials.test).toBeDefined();
		});

		it('should test against fleet/vehicles endpoint', () => {
			const test = credentials.test as {
				request: {
					baseURL: string;
					url: string;
				};
			};

			expect(test.request.baseURL).toBe('https://api.samsara.com');
			expect(test.request.url).toBe('/fleet/vehicles');
		});
	});
});
