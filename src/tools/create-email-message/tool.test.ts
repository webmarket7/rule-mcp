import { vi, describe, it, expect, afterEach } from 'vitest';
import { registerTool } from './tool.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient } from '@rulecom/sdk';

afterEach(() => {
  vi.restoreAllMocks();
});

type Handler = (args: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;

const mockMessage = { id: 10, campaignId: 1, subject: 'Hello World' };

function makeClient(overrides?: Partial<RuleClient['messages']>): RuleClient {
  return {
    messages: {
      createEmailCampaignMessage: vi.fn().mockResolvedValue(mockMessage),
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

describe('create-email-message handler', () => {
  it('creates a message and returns response JSON', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({
      campaignId: 1,
      subject: 'Hello World',
      fromName: 'Jane',
      fromEmail: 'jane@acme.com',
    });
    expect(result.isError).toBeFalsy();
    const response = JSON.parse(result.content[0].text);
    expect(response.id).toBe(10);
    expect(client.messages.createEmailCampaignMessage).toHaveBeenCalledWith(1, {
      subject: 'Hello World',
      preheader: undefined,
      fromName: 'Jane',
      fromEmail: 'jane@acme.com',
      utmCampaign: undefined,
      utmTerm: undefined,
    });
  });

  it('creates a message with only required fields', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({ campaignId: 5, subject: 'Minimal' });
    expect(result.isError).toBeFalsy();
    expect(client.messages.createEmailCampaignMessage).toHaveBeenCalledWith(5, expect.objectContaining({
      subject: 'Minimal',
    }));
  });

  it('returns isError when SDK throws', async () => {
    const client = makeClient({
      createEmailCampaignMessage: vi.fn().mockRejectedValue(new Error('Not found')),
    });
    const call = captureHandler(client);
    const result = await call({ campaignId: 1, subject: 'Test' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Not found/);
  });
});
