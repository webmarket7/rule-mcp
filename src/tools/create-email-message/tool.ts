import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient } from '@rulecom/sdk';
import { inputSchemaShape } from './schemas.js';

export function registerTool(server: McpServer, ruleClient: RuleClient): RegisteredTool {
  return server.registerTool('create-email-message', {
    title: 'Create Email Message',
    description:
      'Creates a new email message for a campaign in Rule. ' +
      'A message holds the subject line, sender details, and UTM parameters. ' +
      'Returns the created message with its ID, which is required by create-dynamic-set. ' +
      'Full workflow: create-campaign → create-email-message → create-dynamic-set.',
    inputSchema: inputSchemaShape,
  }, async (args) => {
    try {
      const response = await ruleClient.messages.createEmailCampaignMessage(args.campaignId, {
        subject: args.subject,
        preheader: args.preheader,
        fromName: args.fromName,
        fromEmail: args.fromEmail,
        utmCampaign: args.utmCampaign,
        utmTerm: args.utmTerm,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{
          type: 'text',
          text: `Message creation failed: ${err instanceof Error ? err.message : String(err)}`,
        }],
        isError: true,
      };
    }
  });
}
