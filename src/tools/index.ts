import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RuleClient } from '@rulecom/sdk';

import { registerTool as registerGenerateEmailThemeTool } from './generate-email-theme/index.js';


export function registerTools(server: McpServer, ruleClient: RuleClient): void {
  registerGenerateEmailThemeTool(server, ruleClient);
}