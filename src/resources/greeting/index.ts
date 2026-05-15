import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGreetingResource(server: McpServer): void {
  server.resource(
    "greeting",
    "greeting://hello",
    { mimeType: "text/plain" },
    async () => ({
      contents: [{ uri: "greeting://hello", text: "Hello from rule-mcp!" }],
    })
  );
}
