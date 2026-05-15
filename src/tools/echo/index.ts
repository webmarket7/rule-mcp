import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerEchoTool(server: McpServer): void {
  server.tool(
    "echo",
    "Echoes the input message back",
    { message: z.string().describe("Message to echo") },
    async ({ message }) => ({
      content: [{ type: "text", text: message }],
    })
  );
}
