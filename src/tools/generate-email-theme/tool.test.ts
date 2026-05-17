import { vi, describe, it, expect, afterEach } from 'vitest';
import { registerTool } from './tool.js';
import { createEmailTheme } from '@rulecom/sdk';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient } from '@rulecom/sdk';

vi.mock('@rulecom/sdk', async (importActual) => {
  const actual = await importActual<typeof import('@rulecom/sdk')>();
  return { ...actual, createEmailTheme: vi.fn(actual.createEmailTheme) };
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function mockFetch(css: string, ok = true) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok, text: async () => css }));
}

function mockFetchError() {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
}

type Handler = (args: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;

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

const baseArgs = { description: 'test theme' };

// ─── success paths ────────────────────────────────────────────────────────────

describe('registerTool handler', () => {
  it('returns valid theme JSON for minimal args', async () => {
    const call = captureHandler();
    const result = await call(baseArgs);
    expect(result.isError).toBeFalsy();
    const theme = JSON.parse(result.content[0].text);
    expect(theme).toBeDefined();
  });

  it('returns theme JSON with system font and color args', async () => {
    const call = captureHandler();
    const result = await call({
      ...baseArgs,
      fontFamily: 'Georgia',
      primaryColor: '#1D4ED8',
    });
    expect(result.isError).toBeFalsy();
    const theme = JSON.parse(result.content[0].text);
    expect(theme).toBeDefined();
  });

  it('returns theme JSON with web font when CSS fetch succeeds', async () => {
    mockFetch(`@font-face { font-family: 'Lato'; src: url(...); }`);
    const call = captureHandler();
    const result = await call({
      ...baseArgs,
      fontFamily: 'Lato',
      fontFamilyUrl: 'https://fonts.googleapis.com/css?family=Lato',
    });
    expect(result.isError).toBeFalsy();
    JSON.parse(result.content[0].text);
  });

  it('prepends warning when font CSS fetch fails but still returns theme', async () => {
    mockFetchError();
    const call = captureHandler();
    const result = await call({
      ...baseArgs,
      fontFamily: 'Lato',
      fontFamilyUrl: 'https://fonts.googleapis.com/css?family=Lato',
    });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toMatch(/^Warning:/);
    // Theme JSON still follows the warning
    const jsonPart = result.content[0].text.split('\n\n').slice(1).join('\n\n');
    JSON.parse(jsonPart);
  });

  it('prepends warning on non-200 font CSS response', async () => {
    mockFetch('', false);
    const call = captureHandler();
    const result = await call({
      ...baseArgs,
      fontFamily: 'Lato',
      fontFamilyUrl: 'https://fonts.googleapis.com/css?family=Lato',
    });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toMatch(/^Warning:/);
  });

// ─── error paths ──────────────────────────────────────────────────────────────

  it('returns isError for non-system font without URL', async () => {
    const call = captureHandler();
    const result = await call({ ...baseArgs, fontFamily: 'Lato' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/not a supported system font/);
  });

  it('returns isError when fontFamilyUrl provided without fontFamily', async () => {
    const call = captureHandler();
    const result = await call({
      ...baseArgs,
      fontFamilyUrl: 'https://fonts.googleapis.com/css?family=Lato',
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/fontFamily is missing/);
  });

  it('returns isError when font family not found in fetched CSS', async () => {
    mockFetch(`@font-face { font-family: 'Open Sans'; src: url(...); }`);
    const call = captureHandler();
    const result = await call({
      ...baseArgs,
      fontFamily: 'Lato',
      fontFamilyUrl: 'https://fonts.googleapis.com/css?family=Open+Sans',
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/not found in the CSS/);
  });

  it('returns isError when createEmailTheme throws an Error', async () => {
    vi.mocked(createEmailTheme).mockImplementationOnce(() => { throw new Error('SDK error'); });
    const call = captureHandler();
    const result = await call(baseArgs);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Theme generation failed: SDK error/);
  });

  it('returns isError when createEmailTheme throws a non-Error value', async () => {
    vi.mocked(createEmailTheme).mockImplementationOnce(() => { throw 'raw string error'; });
    const call = captureHandler();
    const result = await call(baseArgs);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Theme generation failed: raw string error/);
  });
});
