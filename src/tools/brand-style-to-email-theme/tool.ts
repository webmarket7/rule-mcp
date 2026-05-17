import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { emailThemeFromBrandStyle } from '@rulecom/sdk';
import type { RuleClient, RuleBrandStyle } from '@rulecom/sdk';
import { inputSchemaShape } from './schemas.js';

export function registerTool(server: McpServer, _ruleClient: RuleClient): RegisteredTool {
  return server.registerTool('brand-style-to-email-theme', {
    title: 'Brand Style to Email Theme',
    description:
      'Converts a brand style (as returned by get-brand-style) into an EmailTheme. ' +
      'The resulting theme can be used with apply-theme or further customized with modify-email-theme. ' +
      'Before calling this tool, call get-brand-style to fetch the brand style JSON.',
    inputSchema: inputSchemaShape,
  }, async (args) => {
    let brandStyle: RuleBrandStyle;
    try {
      brandStyle = JSON.parse(args.brandStyle) as RuleBrandStyle;
    } catch {
      return {
        content: [{ type: 'text', text: 'Invalid brand style JSON: could not parse input.' }],
        isError: true,
      };
    }

    try {
      const theme = emailThemeFromBrandStyle(brandStyle);
      return { content: [{ type: 'text', text: JSON.stringify(theme, null, 2) }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Failed to convert brand style: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }
  });
}
