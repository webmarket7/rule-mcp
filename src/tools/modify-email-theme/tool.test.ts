import { vi, describe, it, expect, afterEach } from 'vitest';
import { registerTool } from './tool.js';
import { createEmailTheme } from '@rulecom/sdk';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient } from '@rulecom/sdk';

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

const baseTheme = createEmailTheme();
const baseThemeJson = JSON.stringify(baseTheme);

// ─── success paths ────────────────────────────────────────────────────────────

describe('modify-email-theme handler', () => {
  it('returns the theme unchanged when no overrides are provided', async () => {
    const call = captureHandler();
    const result = await call({ theme: baseThemeJson });
    expect(result.isError).toBeFalsy();
    const theme = JSON.parse(result.content[0].text);
    expect(theme.colors).toBeDefined();
    expect(theme.fontStyles).toBeDefined();
  });

  it('applies a primary color override', async () => {
    const call = captureHandler();
    const result = await call({ theme: baseThemeJson, primaryColor: '#FF0000' });
    expect(result.isError).toBeFalsy();
    const theme = JSON.parse(result.content[0].text);
    expect(theme.colors.primary.hex).toBe('#FF0000');
  });

  it('applies a system font override', async () => {
    const call = captureHandler();
    const result = await call({ theme: baseThemeJson, fontFamily: 'Georgia' });
    expect(result.isError).toBeFalsy();
    const theme = JSON.parse(result.content[0].text);
    expect(theme.fontStyles.p.fontFamily).toBe('Georgia');
    expect(theme.fontStyles.h1.fontFamily).toBe('Georgia');
  });

  it('applies a web font override when CSS fetch succeeds', async () => {
    mockFetch(`@font-face { font-family: 'Lato'; src: url(...); }`);
    const call = captureHandler();
    const result = await call({
      theme: baseThemeJson,
      fontFamily: 'Lato',
      fontFamilyUrl: 'https://fonts.googleapis.com/css?family=Lato',
    });
    expect(result.isError).toBeFalsy();
    const theme = JSON.parse(result.content[0].text);
    expect(theme.fontStyles.p.fontFamily).toBe('Lato');
  });

  it('prepends warning when font CSS fetch fails but still returns theme', async () => {
    mockFetchError();
    const call = captureHandler();
    const result = await call({
      theme: baseThemeJson,
      fontFamily: 'Lato',
      fontFamilyUrl: 'https://fonts.googleapis.com/css?family=Lato',
    });
    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toMatch(/^Warning:/);
    const jsonPart = result.content[0].text.split('\n\n').slice(1).join('\n\n');
    JSON.parse(jsonPart);
  });

// ─── error paths ──────────────────────────────────────────────────────────────

  it('returns isError for invalid theme JSON', async () => {
    const call = captureHandler();
    const result = await call({ theme: 'not json' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Invalid theme JSON/);
  });

  it('returns isError for non-system font without URL', async () => {
    const call = captureHandler();
    const result = await call({ theme: baseThemeJson, fontFamily: 'Lato' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/not a supported system font/);
  });

  it('returns isError when fontFamilyUrl provided without fontFamily', async () => {
    const call = captureHandler();
    const result = await call({
      theme: baseThemeJson,
      fontFamilyUrl: 'https://fonts.googleapis.com/css?family=Lato',
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/fontFamily is missing/);
  });

  it('returns isError when font family not found in fetched CSS', async () => {
    mockFetch(`@font-face { font-family: 'Open Sans'; src: url(...); }`);
    const call = captureHandler();
    const result = await call({
      theme: baseThemeJson,
      fontFamily: 'Lato',
      fontFamilyUrl: 'https://fonts.googleapis.com/css?family=Open+Sans',
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/not found in the CSS/);
  });
});
