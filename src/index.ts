import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { RuleClient } from '@rulecom/sdk';

import { createConfig } from './config.js';
import { createRuleClient } from './rule-client.js';
import { registerTools } from './tools/index.js';
import { registerResources } from './resources/index.js';


export const createServer = (): McpServer => {
  return new McpServer({
    name: "rule-mcp",
    version: "0.1.0"
  }, {
    capabilities: {
      tools: { listChanged: true },
      resources: { listChanged: true },
    }
  });
}

async function main() {
  const config = createConfig();
  const server: McpServer = createServer();
  const ruleClient: RuleClient = createRuleClient(config);
  const transport = new StdioServerTransport();

  registerTools(server, ruleClient);
  registerResources(server);

  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
