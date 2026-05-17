import { vi, describe, it, expect, afterEach } from 'vitest';
import { registerTool } from './tool.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient } from '@rulecom/sdk';

afterEach(() => {
  vi.restoreAllMocks();
});

type Handler = (args: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;

function makeClient(overrides?: Partial<RuleClient['templates']>): RuleClient {
  return {
    templates: {
      create: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      render: vi.fn().mockResolvedValue('<html><body>Hello</body></html>'),
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

describe('render-email-template handler', () => {
  it('returns rendered HTML on success', async () => {
    const html = '<html><body>Hello</body></html>';
    const client = makeClient({ render: vi.fn().mockResolvedValue(html) });
    const call = captureHandler(client);
    const result = await call({ id: 42 });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toBe(html);
  });

  it('passes subscriber_id when subscriberId is provided', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    await call({ id: 42, subscriberId: 99 });
    expect(client.templates.render).toHaveBeenCalledWith(42, { subscriber_id: 99 });
  });

  it('passes undefined params when subscriberId is omitted', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    await call({ id: 42 });
    expect(client.templates.render).toHaveBeenCalledWith(42, undefined);
  });

  it('returns isError when render returns null', async () => {
    const client = makeClient({ render: vi.fn().mockResolvedValue(null) });
    const call = captureHandler(client);
    const result = await call({ id: 7 });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Template not found/);
    expect(result.content[0].text).toMatch(/7/);
  });

  it('returns isError when render throws', async () => {
    const client = makeClient({ render: vi.fn().mockRejectedValue(new Error('network error')) });
    const call = captureHandler(client);
    const result = await call({ id: 42 });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/network error/);
  });
});
