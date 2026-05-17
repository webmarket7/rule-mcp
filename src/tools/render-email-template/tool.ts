import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient } from '@rulecom/sdk';
import { inputSchemaShape } from './schemas.js';

export function registerTool(server: McpServer, ruleClient: RuleClient): RegisteredTool {
  return server.registerTool('render-email-template', {
    title: 'Render Email Template',
    description:
      'Renders a Rule email template to HTML for previewing. ' +
      'Pass the template ID returned by create-email-template. ' +
      'Optionally pass subscriberId to substitute merge tags with a specific subscriber\'s field values.',
    inputSchema: inputSchemaShape,
  }, async (args) => {
    try {
      const params = args.subscriberId !== undefined
        ? { subscriber_id: args.subscriberId }
        : undefined;
      const html = await ruleClient.templates.render(args.id, params);
      if (html === null) {
        return {
          content: [{ type: 'text', text: `Template not found (id: ${args.id})` }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: html }],
      };
    } catch (err) {
      return {
        content: [{
          type: 'text',
          text: `Render failed: ${err instanceof Error ? err.message : String(err)}`,
        }],
        isError: true,
      };
    }
  });
}
