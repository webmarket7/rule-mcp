import { vi, describe, it, expect, afterEach } from 'vitest';
import { registerTool } from './tool.js';
import { safeValidateEmailTemplate } from '@rulecom/sdk';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient, RcmlDocument } from '@rulecom/sdk';

vi.mock('@rulecom/sdk', async (importActual) => {
  const actual = await importActual<typeof import('@rulecom/sdk')>();
  return {
    ...actual,
    safeValidateEmailTemplate: vi.fn(actual.safeValidateEmailTemplate),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

type Handler = (args: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;

const validRcml: RcmlDocument = {
  tagName: 'rcml',
  children: [
    { tagName: 'rc-head', children: [] },
    {
      tagName: 'rc-body',
      children: [
        {
          tagName: 'rc-section',
          children: [
            {
              tagName: 'rc-column',
              children: [
                {
                  tagName: 'rc-text',
                  content: {
                    type: 'doc',
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

function makeClient(overrides?: Partial<RuleClient['templates']>): RuleClient {
  return {
    templates: {
      createEmailTemplate: vi.fn().mockResolvedValue({ id: 42, name: 'Test', content: validRcml, messageType: 'email', createdAt: '2024-01-01', updatedAt: '2024-01-01' }),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      render: vi.fn(),
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

describe('create-email-template handler', () => {
  it('creates a template successfully and returns response JSON', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    const result = await call({
      rcml: JSON.stringify(validRcml),
      name: 'Summer Sale',
      messageType: 'email',
    });
    expect(result.isError).toBeFalsy();
    const response = JSON.parse(result.content[0].text);
    expect(response.id).toBe(42);
    expect(client.templates.createEmailTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Summer Sale', content: expect.objectContaining({}) })
    );
  });

  it('returns isError for invalid RCML JSON', async () => {
    const call = captureHandler();
    const result = await call({ rcml: 'not json {{', name: 'Test', messageType: 'email' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Invalid RCML/);
  });

  it('returns isError when RCML fails validation', async () => {
    vi.mocked(safeValidateEmailTemplate).mockReturnValueOnce({
      success: false,
      errors: [{ path: '', code: 'ROOT_INVALID', message: 'Bad root' }],
    });
    const call = captureHandler();
    const result = await call({
      rcml: JSON.stringify(validRcml),
      name: 'Test',
      messageType: 'email',
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/validation failed/);
    expect(result.content[0].text).toMatch(/ROOT_INVALID/);
  });

  it('returns isError when ruleClient.templates.create throws', async () => {
    const client = makeClient({
      createEmailTemplate: vi.fn().mockRejectedValue(new Error('API error')),
    });
    const call = captureHandler(client);
    const result = await call({
      rcml: JSON.stringify(validRcml),
      name: 'Test',
      messageType: 'email',
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/API error/);
  });

  it('always uses email as message_type', async () => {
    const client = makeClient();
    const call = captureHandler(client);
    await call({
      rcml: JSON.stringify(validRcml),
      name: 'Test',
    });
    expect(client.templates.createEmailTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test', content: expect.objectContaining({}) })
    );
  });
});
