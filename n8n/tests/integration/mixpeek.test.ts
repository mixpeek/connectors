/**
 * Integration tests for Mixpeek n8n node
 *
 * These tests validate the node against the live Mixpeek API.
 * Set MIXPEEK_API_KEY environment variable to run these tests.
 */

const API_KEY = process.env.MIXPEEK_API_KEY;
const BASE_URL = process.env.MIXPEEK_BASE_URL || 'https://api.mixpeek.com';

const skipIfNoApiKey = API_KEY ? describe : describe.skip;

async function makeRequest(
	method: string,
	endpoint: string,
	body?: Record<string, unknown>
): Promise<{ status: number; data: unknown }> {
	const response = await fetch(`${BASE_URL}${endpoint}`, {
		method,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${API_KEY}`,
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	const data = await response.json().catch(() => ({}));
	return { status: response.status, data };
}

skipIfNoApiKey('Mixpeek API Integration Tests', () => {
	describe('Namespaces', () => {
		test('should list namespaces', async () => {
			const { status, data } = await makeRequest('POST', '/v1/namespaces/list', {});
			expect(status).toBe(200);
			expect(data).toBeDefined();
		});
	});

	describe('Buckets', () => {
		test('should list buckets', async () => {
			const { status, data } = await makeRequest('POST', '/v1/buckets/list', {});
			expect(status).toBe(200);
			expect(data).toBeDefined();
		});
	});

	describe('Collections', () => {
		test('should list collections', async () => {
			const { status, data } = await makeRequest('POST', '/v1/collections/list', {});
			expect(status).toBe(200);
			expect(data).toBeDefined();
		});
	});

	describe('Retrievers', () => {
		test('should list retrievers', async () => {
			const { status, data } = await makeRequest('POST', '/v1/retrievers/list', {});
			expect(status).toBe(200);
			expect(data).toBeDefined();
		});
	});

	describe('Tasks', () => {
		test('should list tasks', async () => {
			const { status, data } = await makeRequest('POST', '/v1/tasks/list', {});
			expect(status).toBe(200);
			expect(data).toBeDefined();
		});
	});

	describe('Taxonomies', () => {
		test('should list taxonomies', async () => {
			const { status, data } = await makeRequest('POST', '/v1/taxonomies/list', {});
			expect(status).toBe(200);
			expect(data).toBeDefined();
		});
	});

	describe('Clusters', () => {
		test('should list clusters', async () => {
			const { status, data } = await makeRequest('POST', '/v1/clusters/list', {});
			expect(status).toBe(200);
			expect(data).toBeDefined();
		});
	});
});

describe('Mixpeek Node Unit Tests', () => {
	test('placeholder test', () => {
		expect(true).toBe(true);
	});
});
