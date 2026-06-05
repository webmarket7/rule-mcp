import { vi, describe, it, expect, afterEach } from 'vitest';
import { registerTool } from './tool.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient, BrandStyle } from '@rulecom/sdk';

afterEach(() => {
  vi.restoreAllMocks();
});

type Handler = (args: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;

const mockBrandStyle: BrandStyle = {
  id: 42,
  accountId: 1,
  name: 'Acme Brand',
  description: 'Main brand style',
  domain: 'acme.com',
  isDefault: true,
  colours: [{ id: 1, brandStyleId: 42, type: 'brand', hex: '#FF5733', brightness: 50, createdAt: '2024-01-01', updatedAt: '2024-01-01' }],
  fonts: [],
  links: [],
  images: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockStyleB: BrandStyle = { ...mockBrandStyle, id: 99, name: 'Secondary Brand', isDefault: false };

function makeClient(overrides?: Partial<RuleClient['brandStyles']>): RuleClient {
  return {
    brandStyles: {
      list: vi.fn().mockResolvedValue([
        { id: 42, name: 'Acme Brand', isDefault: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 99, name: 'Secondary Brand', isDefault: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ]),
      get: vi.fn().mockImplementation(async (id: number) => {
        if (id === 42) return mockBrandStyle;
        if (id === 99) return mockStyleB;
        return null;
      }),
      ...overrides,
    },
  } as unknown as RuleClient;
}

function captureHandler(client: RuleClient): Handler {
  let handler!: Handler;
  const mockServer = {
    registerTool: vi.fn().mockImplementation((_name: string, _config: unknown, h: Handler) => {
      handler = h;
      return {};
    }),
  } as unknown as McpServer;
  registerTool(mockServer, client);
  return (args) => handler(args);
}

// ─── fetch by id ──────────────────────────────────────────────────────────────

describe('get-brand-style handler', () => {
  it('returns brand style JSON when fetched by id', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({ id: 42 });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(42);
    expect(parsed.name).toBe('Acme Brand');
    expect(client.brandStyles.get).toHaveBeenCalledWith(42);
    expect(client.brandStyles.list).not.toHaveBeenCalled();
  });

  it('returns isError when id not found', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({ id: 999 });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/not found/);
  });

// ─── fetch by name ────────────────────────────────────────────────────────────

  it('returns brand style JSON when fetched by name (case-insensitive)', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({ name: 'secondary brand' });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(99);
  });

  it('returns isError when name not found and lists available names', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({ name: 'Unknown Brand' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Acme Brand/);
    expect(result.content[0].text).toMatch(/Secondary Brand/);
  });

// ─── fetch default ────────────────────────────────────────────────────────────

  it('returns the is_default brand style when no args provided', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({});
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(42);
    expect(parsed.isDefault).toBe(true);
  });

  it('falls back to first item when none is marked default', async () => {
    const client = makeClient({
      list: vi.fn().mockResolvedValue([
        { id: 10, name: 'First', isDefault: false, createdAt: '', updatedAt: '' },
        { id: 20, name: 'Second', isDefault: false, createdAt: '', updatedAt: '' },
      ]),
      get: vi.fn().mockResolvedValue({ ...mockBrandStyle, id: 10, name: 'First', isDefault: false }),
    });
    const call = captureHandler(client);
    const result = await call({});
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.id).toBe(10);
  });

  it('returns isError when account has no brand styles', async () => {
    const client = makeClient({
      list: vi.fn().mockResolvedValue([]),
    });
    const call = captureHandler(client);
    const result = await call({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/No brand styles found/);
  });

// ─── error handling ───────────────────────────────────────────────────────────

  it('returns isError when brandStyles.get throws', async () => {
    const client = makeClient({
      get: vi.fn().mockRejectedValue(new Error('API error')),
    });
    const call = captureHandler(client);
    const result = await call({ id: 42 });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/API error/);
  });

  it('returns isError when brandStyles.list throws', async () => {
    const client = makeClient({
      list: vi.fn().mockRejectedValue(new Error('Network error')),
    });
    const call = captureHandler(client);
    const result = await call({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Network error/);
  });
});
