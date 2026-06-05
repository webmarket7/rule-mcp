import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RuleClient } from '@rulecom/sdk';
import { inputSchemaShape } from './schemas.js';

export function registerTool(server: McpServer, ruleClient: RuleClient): RegisteredTool {
  return server.registerTool('get-brand-style', {
    title: 'Get Brand Style',
    description:
      'Fetches a brand style from the Rule account. ' +
      'Provide id to fetch by numeric ID, name to search by name (case-insensitive), ' +
      'or omit both to retrieve the account\'s default (favorite) brand style. ' +
      'Returns the full brand style JSON, which can be passed to brand-style-to-email-theme.',
    inputSchema: inputSchemaShape,
  }, async (args) => {
    try {
      if (args.id !== undefined) {
        const response = await ruleClient.brandStyles.get(args.id);
        if (!response) {
          return {
            content: [{ type: 'text', text: `Brand style with ID ${args.id} not found.` }],
            isError: true,
          };
        }
        return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
      }

      const items = await ruleClient.brandStyles.list();

      if (items.length === 0) {
        return {
          content: [{ type: 'text', text: 'No brand styles found in this account.' }],
          isError: true,
        };
      }

      let targetId: number;
      if (args.name !== undefined) {
        const found = items.find((s) => s.name.toLowerCase() === args.name!.toLowerCase());
        if (!found) {
          const names = items.map((s) => s.name).join(', ');
          return {
            content: [{ type: 'text', text: `Brand style '${args.name}' not found. Available: ${names}` }],
            isError: true,
          };
        }
        targetId = found.id;
      } else {
        const defaultItem = items.find((s) => s.isDefault) ?? items[0];
        targetId = defaultItem.id;
      }

      const response = await ruleClient.brandStyles.get(targetId);
      if (!response) {
        return {
          content: [{ type: 'text', text: `Could not retrieve brand style with ID ${targetId}.` }],
          isError: true,
        };
      }
      return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Failed to fetch brand style: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }
  });
}
