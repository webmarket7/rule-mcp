import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createEmailTheme } from '@rulecom/sdk';
import type { RuleClient } from '@rulecom/sdk';
import { inputSchemaShape, buildPatch } from './patch-builder.js';
import { validateFontArgs } from './fonts.js';

export function registerTool(server: McpServer, _ruleClient: RuleClient): RegisteredTool {
  return server.registerTool('generate-email-theme', {
    title: 'Generate Email Theme',
    description:
      'Generates a complete, validated EmailTheme from semantic style parameters. ' +
      'All fields are optional — unspecified slots fall back to SDK defaults. ' +
      'Before calling this tool, read the email-theme://design-guide resource for color semantics, ' +
      'typography guidance, style recipes, and WCAG contrast rules. ' +
      'Read email-theme://defaults for default values and all available enum types.',
    inputSchema: inputSchemaShape,
  }, async (args) => {
    const fontValidation = await validateFontArgs(args.fontFamily, args.fontFamilyUrl);
    if (fontValidation.kind === 'error') {
      return {
        content: [{ type: 'text', text: fontValidation.message }],
        isError: true,
      };
    }

    try {
      const theme = createEmailTheme(buildPatch(args));
      const themeJson = JSON.stringify(theme, null, 2);
      const text = fontValidation.kind === 'warning'
        ? `Warning: ${fontValidation.message}\n\n${themeJson}`
        : themeJson;
      return { content: [{ type: 'text', text }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Theme generation failed: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }
  });
}
