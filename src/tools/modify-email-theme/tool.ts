import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient, EmailTheme } from '@rulecom/sdk';
import { buildPatch } from '../generate-email-theme/patch-builder.js';
import type { Input as PatchInput } from '../generate-email-theme/patch-builder.js';
import { validateFontArgs } from '../generate-email-theme/fonts.js';
import { inputSchemaShape } from './schemas.js';
import { mergeThemePatch } from './theme-merger.js';

export function registerTool(server: McpServer, _ruleClient: RuleClient): RegisteredTool {
  return server.registerTool('modify-email-theme', {
    title: 'Modify Email Theme',
    description:
      'Applies property overrides to an existing EmailTheme. ' +
      'Works on output from generate-email-theme, brand-style-to-email-theme, or a prior modify-email-theme call. ' +
      'Only the provided fields are changed; all other slots keep their current values.',
    inputSchema: inputSchemaShape,
  }, async (args) => {
    const { theme: themeJson, ...overrideArgs } = args;

    let baseTheme: EmailTheme;
    try {
      baseTheme = JSON.parse(themeJson) as EmailTheme;
    } catch {
      return {
        content: [{ type: 'text', text: 'Invalid theme JSON: could not parse input.' }],
        isError: true,
      };
    }

    const fontValidation = await validateFontArgs(overrideArgs.fontFamily, overrideArgs.fontFamilyUrl);
    if (fontValidation.kind === 'error') {
      return {
        content: [{ type: 'text', text: fontValidation.message }],
        isError: true,
      };
    }

    try {
      const patch = buildPatch({ description: '', ...overrideArgs } as PatchInput);
      const theme = mergeThemePatch(baseTheme, patch);
      const themeResult = JSON.stringify(theme, null, 2);
      const text = fontValidation.kind === 'warning'
        ? `Warning: ${fontValidation.message}\n\n${themeResult}`
        : themeResult;
      return { content: [{ type: 'text', text }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Theme modification failed: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }
  });
}
