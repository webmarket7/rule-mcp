import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient, RcmlDocument } from '@rulecom/sdk';
import { inputSchemaShape } from './schemas.js';

export function registerTool(server: McpServer, ruleClient: RuleClient): RegisteredTool {
  return server.registerTool('create-default-email-campaign', {
    title: 'Create Default Email Campaign',
    description:
      'Creates a complete email campaign with all dependencies (campaign, message, template, ' +
      'dynamic set) in one atomic call. Automatically rolls back all created resources if any ' +
      'step fails. Pass `template.content` to supply a custom RCML document — otherwise the SDK ' +
      'auto-generates a branded template from `brandStyleId`.',
    inputSchema: inputSchemaShape,
  }, async (args) => {
    try {
      const response = await ruleClient.campaigns.createDefaultEmailCampaign({
        brandStyleId: args.brandStyleId,
        name: args.name,
        sendoutType: args.sendoutType,
        message: args.message,
        template: args.template
          ? {
              name: args.template.name,
              content: args.template.content as RcmlDocument | undefined,
            }
          : undefined,
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
