import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RuleClient } from '@rulecom/sdk';

import { registerTool as registerGenerateEmailThemeTool } from './generate-email-theme/index.js';
import { registerTool as registerGetBrandStyleTool } from './get-brand-style/index.js';
import { registerTool as registerBrandStyleToEmailThemeTool } from './brand-style-to-email-theme/index.js';
import { registerTool as registerModifyEmailThemeTool } from './modify-email-theme/index.js';
import { registerTool as registerGenerateEmailRcmlDocTool } from './generate-email-rcml-doc/index.js';
import { registerTool as registerCreateEmailTemplateTool } from './create-email-template/index.js';
import { registerTool as registerRenderEmailTemplateTool } from './render-email-template/index.js';
import { registerTool as registerCreateCampaignTool } from './create-campaign/index.js';
import { registerTool as registerCreateEmailMessageTool } from './create-email-message/index.js';
import { registerTool as registerCreateDynamicSetTool } from './create-dynamic-set/index.js';


export function registerTools(server: McpServer, ruleClient: RuleClient): void {
  registerGenerateEmailThemeTool(server, ruleClient);
  registerGetBrandStyleTool(server, ruleClient);
  registerBrandStyleToEmailThemeTool(server, ruleClient);
  registerModifyEmailThemeTool(server, ruleClient);
  registerGenerateEmailRcmlDocTool(server, ruleClient);
  registerCreateEmailTemplateTool(server, ruleClient);
  registerRenderEmailTemplateTool(server, ruleClient);
  registerCreateCampaignTool(server, ruleClient);
  registerCreateEmailMessageTool(server, ruleClient);
  registerCreateDynamicSetTool(server, ruleClient);
}