import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RuleClient } from '@rulecom/sdk';

import { registerTool as registerGenerateEmailThemeTool } from './generate-email-theme/index.js';
import { registerTool as registerGetBrandStyleTool } from './get-brand-style/index.js';
import { registerTool as registerBrandStyleToEmailThemeTool } from './brand-style-to-email-theme/index.js';
import { registerTool as registerModifyEmailThemeTool } from './modify-email-theme/index.js';


export function registerTools(server: McpServer, ruleClient: RuleClient): void {
  registerGenerateEmailThemeTool(server, ruleClient);
  registerGetBrandStyleTool(server, ruleClient);
  registerBrandStyleToEmailThemeTool(server, ruleClient);
  registerModifyEmailThemeTool(server, ruleClient);
}