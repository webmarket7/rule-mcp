import { vi, describe, it, expect, afterEach } from 'vitest';
import { registerTool } from './tool.js';
import { emailThemeFromBrandStyle } from '@rulecom/sdk';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient, BrandStyle } from '@rulecom/sdk';

vi.mock('@rulecom/sdk', async (importActual) => {
  const actual = await importActual<typeof import('@rulecom/sdk')>();
  return { ...actual, emailThemeFromBrandStyle: vi.fn(actual.emailThemeFromBrandStyle) };
});

afterEach(() => {
  vi.restoreAllMocks();
});

type Handler = (args: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[]; isError?: boolean }>;

const mockBrandStyle: BrandStyle = {
  id: 42,
  accountId: 1,
  name: 'Acme Brand',
  isDefault: true,
  colours: [{ id: 1, brandStyleId: 42, type: 'brand', hex: '#FF5733', brightness: 50, createdAt: '2024-01-01', updatedAt: '2024-01-01' }],
  fonts: [],
  links: [],
  images: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
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

describe('brand-style-to-email-theme handler', () => {
  it('converts valid brand style JSON to an EmailTheme', async () => {
    const call = captureHandler();
    const result = await call({ brandStyle: JSON.stringify(mockBrandStyle) });
    expect(result.isError).toBeFalsy();
    const theme = JSON.parse(result.content[0].text);
    expect(theme).toBeDefined();
    expect(theme.colors).toBeDefined();
    expect(theme.fontStyles).toBeDefined();
    expect(emailThemeFromBrandStyle).toHaveBeenCalledWith(mockBrandStyle);
  });

  it('returns isError for invalid (non-JSON) brandStyle input', async () => {
    const call = captureHandler();
    const result = await call({ brandStyle: 'not json at all' });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Invalid brand style JSON/);
  });

  it('returns isError when emailThemeFromBrandStyle throws', async () => {
    vi.mocked(emailThemeFromBrandStyle).mockImplementationOnce(() => { throw new Error('conversion error'); });
    const call = captureHandler();
    const result = await call({ brandStyle: JSON.stringify(mockBrandStyle) });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/conversion error/);
  });
});
