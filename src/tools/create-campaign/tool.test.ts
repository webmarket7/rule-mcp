import { vi, describe, it, expect, afterEach } from 'vitest';
import { registerTool } from './tool.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient } from '@rulecom/sdk';

afterEach(() => {
  vi.restoreAllMocks();
});

type Handler = (args: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;

const mockCampaign = { id: 1, name: 'Test Campaign', sendoutType: 'marketing' };

function makeClient(overrides?: Partial<RuleClient['campaigns']>): RuleClient {
  return {
    campaigns: {
      createEmailCampaign: vi.fn().mockResolvedValue(mockCampaign),
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

describe('create-campaign handler', () => {
  it('creates a campaign and returns response JSON', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({ name: 'Test Campaign', sendoutType: 'marketing' });
    expect(result.isError).toBeFalsy();
    const response = JSON.parse(result.content[0].text);
    expect(response.id).toBe(1);
    expect(client.campaigns.createEmailCampaign).toHaveBeenCalledWith({
      name: 'Test Campaign',
      sendoutType: 'marketing',
    });
  });

  it('creates a campaign with no arguments', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({});
    expect(result.isError).toBeFalsy();
    expect(client.campaigns.createEmailCampaign).toHaveBeenCalledWith({
      name: undefined,
      sendoutType: undefined,
    });
  });

  it('returns isError when SDK throws', async () => {
    const client = makeClient({
      createEmailCampaign: vi.fn().mockRejectedValue(new Error('API error')),
    });
    const call = captureHandler(client);
    const result = await call({ name: 'Test' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/API error/);
  });
});
