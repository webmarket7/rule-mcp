import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient } from '@rulecom/sdk';
import { inputSchemaShape } from './schemas.js';

export function registerTool(server: McpServer, ruleClient: RuleClient): RegisteredTool {
  return server.registerTool('create-campaign', {
    title: 'Create Campaign',
    description:
      'Creates a new email campaign in Rule. Returns the created campaign with its ID, ' +
      'which is required by create-email-message. ' +
      'Full workflow: create-campaign → create-email-message → create-dynamic-set.',
    inputSchema: inputSchemaShape,
  }, async (args) => {
    try {
      const response = await ruleClient.campaigns.createEmailCampaign({
        name: args.name,
        sendoutType: args.sendoutType,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{
          type: 'text',
          text: `Campaign creation failed: ${err instanceof Error ? err.message : String(err)}`,
        }],
        isError: true,
      };
    }
  });
}
