import { vi, describe, it, expect, afterEach } from 'vitest';
import { registerTool } from './tool.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient } from '@rulecom/sdk';

afterEach(() => {
  vi.restoreAllMocks();
});

type Handler = (args: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;

const mockResult = { campaignId: 1, messageId: 2, templateId: 3, dynamicSetId: 4 };

function makeClient(overrides?: Partial<RuleClient['campaigns']>): RuleClient {
  return {
    campaigns: {
      createDefaultEmailCampaign: vi.fn().mockResolvedValue(mockResult),
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

describe('create-default-email-campaign handler', () => {
  it('creates a campaign and returns all IDs', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({ brandStyleId: 42, name: 'Summer Sale' });
    expect(result.isError).toBeFalsy();
    const response = JSON.parse(result.content[0].text);
    expect(response.campaignId).toBe(1);
    expect(response.templateId).toBe(3);
    expect(client.campaigns.createDefaultEmailCampaign).toHaveBeenCalledWith(
      expect.objectContaining({ brandStyleId: 42, name: 'Summer Sale' })
    );
  });

  it('passes custom RCML template content when provided', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const rcml = { tag: 'rc-doc', children: [] };
    await call({ brandStyleId: 42, template: { name: 'My Template', content: rcml } });
    expect(client.campaigns.createDefaultEmailCampaign).toHaveBeenCalledWith(
      expect.objectContaining({ template: { name: 'My Template', content: rcml } })
    );
  });

  it('returns isError when SDK throws', async () => {
    const client = makeClient({
      createDefaultEmailCampaign: vi.fn().mockRejectedValue(new Error('API error')),
    });
    const call = captureHandler(client);
    const result = await call({ brandStyleId: 42 });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/API error/);
  });
});
