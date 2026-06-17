import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerPrompt as registerCreateEmailTemplatePrompt } from './create-email-template/index.js';
import { registerPrompt as registerCreateEmailCampaignPrompt } from './create-email-campaign/index.js';

export function registerPrompts(server: McpServer): void {
  registerCreateEmailTemplatePrompt(server);
  registerCreateEmailCampaignPrompt(server);
}
