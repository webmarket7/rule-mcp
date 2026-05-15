import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerEchoTool } from "./tools/index.js";
import { registerGreetingResource } from "./resources/index.js";

const server = new McpServer({
  name: "rule-mcp",
  version: "0.1.0",
});

registerEchoTool(server);
registerGreetingResource(server);

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
