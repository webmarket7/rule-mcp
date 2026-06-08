import { vi, describe, it, expect, afterEach } from 'vitest';
import { registerTool } from './tool.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient } from '@rulecom/sdk';

afterEach(() => {
  vi.restoreAllMocks();
});

type Handler = (args: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;

const mockDynamicSet = { id: 100, messageId: 10, templateId: 42, name: 'Default', active: true };

function makeClient(overrides?: Partial<RuleClient['dynamicSets']>): RuleClient {
  return {
    dynamicSets: {
      create: vi.fn().mockResolvedValue(mockDynamicSet),
      ...overrides,
    },
  } as unknown as RuleClient;
}

function captureHandler(client?: RuleClient): Handler {
  let handler!: Handler;
  const mockServer = {
    registerTool: vi.fn().mockImplementation((_name: string, _config: unknown, h: Handler) => {
      handler = h;
      return {};
    }),
  } as unknown as McpServer;
  registerTool(mockServer, client ?? makeClient());
  return (args) => handler(args);
}

describe('create-dynamic-set handler', () => {
  it('creates a dynamic set and returns response JSON', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({ messageId: 10, templateId: 42 });
    expect(result.isError).toBeFalsy();
    const response = JSON.parse(result.content[0].text);
    expect(response.id).toBe(100);
    expect(client.dynamicSets.create).toHaveBeenCalledWith({
      messageId: 10,
      templateId: 42,
      name: undefined,
      active: undefined,
    });
  });

  it('creates a dynamic set with only required messageId', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({ messageId: 10 });
    expect(result.isError).toBeFalsy();
    expect(client.dynamicSets.create).toHaveBeenCalledWith(expect.objectContaining({ messageId: 10 }));
  });

  it('passes name and active flag when provided', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    await call({ messageId: 10, templateId: 42, name: 'Promo', active: false });
    expect(client.dynamicSets.create).toHaveBeenCalledWith({
      messageId: 10,
      templateId: 42,
      name: 'Promo',
      active: false,
    });
  });

  it('returns isError when SDK throws', async () => {
    const client = makeClient({
      create: vi.fn().mockRejectedValue(new Error('Server error')),
    });
    const call = captureHandler(client);
    const result = await call({ messageId: 10 });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Server error/);
  });
});
