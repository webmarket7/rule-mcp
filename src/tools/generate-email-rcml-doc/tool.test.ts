import { vi, describe, it, expect, afterEach } from 'vitest';
import { registerTool } from './tool.js';
import { applyTheme, safeValidateEmailTemplate, createEmailTheme, EmailThemeApplyError } from '@rulecom/sdk';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient, RcmlDocument } from '@rulecom/sdk';

vi.mock('@rulecom/sdk', async (importActual) => {
  const actual = await importActual<typeof import('@rulecom/sdk')>();
  return {
    ...actual,
    applyTheme: vi.fn(actual.applyTheme),
    safeValidateEmailTemplate: vi.fn(actual.safeValidateEmailTemplate),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

type Handler = (args: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;

const minimalRcml: RcmlDocument = {
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

function captureHandler(): Handler {
  let handler!: Handler;
  const mockServer = {
    registerTool: vi.fn().mockImplementation((_name: string, _config: unknown, h: Handler) => {
      handler = h;
      return {};
    }),
  } as unknown as McpServer;
  registerTool(mockServer, {} as RuleClient);
  return (args) => handler(args);
}

describe('generate-email-rcml-doc handler', () => {
  it('returns themed and validated RCML JSON on success', async () => {
    const themedDoc = { ...minimalRcml };
    vi.mocked(applyTheme).mockReturnValueOnce(themedDoc);
    vi.mocked(safeValidateEmailTemplate).mockReturnValueOnce({ success: true, data: themedDoc });
    const call = captureHandler();
    const theme = createEmailTheme();
    const result = await call({
      rcml: JSON.stringify(minimalRcml),
      theme: JSON.stringify(theme),
    });
    expect(result.isError).toBeFalsy();
    const doc = JSON.parse(result.content[0].text);
    expect(doc.tagName).toBe('rcml');
    expect(applyTheme).toHaveBeenCalledWith(minimalRcml, theme);
    expect(safeValidateEmailTemplate).toHaveBeenCalledWith(themedDoc);
  });

  it('passes the applyTheme output to safeValidateEmailTemplate', async () => {
    const themedDoc = { ...minimalRcml, id: 'themed' };
    vi.mocked(applyTheme).mockReturnValueOnce(themedDoc);
    vi.mocked(safeValidateEmailTemplate).mockReturnValueOnce({ success: true, data: themedDoc });
    const call = captureHandler();
    await call({
      rcml: JSON.stringify(minimalRcml),
      theme: JSON.stringify(createEmailTheme()),
    });
    expect(safeValidateEmailTemplate).toHaveBeenLastCalledWith(themedDoc);
  });

  it('returns isError for invalid RCML JSON', async () => {
    const call = captureHandler();
    const result = await call({
      rcml: 'not valid json {{',
      theme: JSON.stringify(createEmailTheme()),
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Invalid RCML/);
  });

  it('returns isError for invalid theme JSON', async () => {
    const call = captureHandler();
    const result = await call({
      rcml: JSON.stringify(minimalRcml),
      theme: 'not valid json {{',
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Invalid theme/);
  });

  it('returns validation errors (not isError) when RCML fails validation', async () => {
    vi.mocked(safeValidateEmailTemplate).mockReturnValueOnce({
      success: false,
      errors: [{ path: '/children/1', code: 'CHILD_INVALID', message: 'Invalid child' }],
    });
    const call = captureHandler();
    const result = await call({
      rcml: JSON.stringify(minimalRcml),
      theme: JSON.stringify(createEmailTheme()),
    });
    expect(result.isError).toBeFalsy();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.valid).toBe(false);
    expect(parsed.errors).toHaveLength(1);
    expect(parsed.errors[0].code).toBe('CHILD_INVALID');
  });

  it('returns isError when applyTheme throws EmailThemeApplyError', async () => {
    vi.mocked(applyTheme).mockImplementationOnce(() => {
      throw new EmailThemeApplyError('Bad logo URL');
    });
    const call = captureHandler();
    const result = await call({
      rcml: JSON.stringify(minimalRcml),
      theme: JSON.stringify(createEmailTheme()),
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Bad logo URL/);
  });

  it('returns isError when applyTheme throws an unexpected error', async () => {
    vi.mocked(applyTheme).mockImplementationOnce(() => {
      throw new Error('unexpected');
    });
    const call = captureHandler();
    const result = await call({
      rcml: JSON.stringify(minimalRcml),
      theme: JSON.stringify(createEmailTheme()),
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/unexpected/);
  });
});
