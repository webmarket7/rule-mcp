import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient } from '@rulecom/sdk';
import { inputSchemaShape } from './schemas.js';

export function registerTool(server: McpServer, ruleClient: RuleClient): RegisteredTool {
  return server.registerTool('create-dynamic-set', {
    title: 'Create Dynamic Set',
    description:
      'Creates a dynamic set that links an email template to a campaign message in Rule. ' +
      'A dynamic set is the final wiring step that connects a visual template (from create-email-template) ' +
      'to a message (from create-email-message). ' +
      'Full workflow: create-campaign → create-email-message → create-dynamic-set.',
    inputSchema: inputSchemaShape,
  }, async (args) => {
    try {
      const response = await ruleClient.dynamicSets.create({
        messageId: args.messageId,
        templateId: args.templateId,
        name: args.name,
        active: args.active,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{
          type: 'text',
          text: `Dynamic set creation failed: ${err instanceof Error ? err.message : String(err)}`,
        }],
        isError: true,
      };
    }
  });
}
