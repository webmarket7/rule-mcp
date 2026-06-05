import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { safeValidateEmailTemplate } from '@rulecom/sdk';
import type { RuleClient, RcmlDocument } from '@rulecom/sdk';
import { inputSchemaShape } from './schemas.js';

export function registerTool(server: McpServer, ruleClient: RuleClient): RegisteredTool {
  return server.registerTool('create-email-template', {
    title: 'Create Email Template',
    description:
      'Creates a new email template in Rule from a validated RcmlDocument JSON. ' +
      'Full workflow: read email-rcml://generation-guide → generate RcmlDocument JSON → ' +
      'call generate-email-rcml-doc (apply theme + validate, iterate until clean) → ' +
      'call this tool to publish. Returns the created template with its ID.',
    inputSchema: inputSchemaShape,
  }, async (args) => {
    let rcmlDoc: RcmlDocument;
    try {
      rcmlDoc = JSON.parse(args.rcml) as RcmlDocument;
    } catch {
      return {
        content: [{ type: 'text', text: 'Invalid RCML: could not parse as JSON.' }],
        isError: true,
      };
    }

    const validation = safeValidateEmailTemplate(rcmlDoc);
    if (!validation.success) {
      const errorList = validation.errors
        .map((e) => `  - ${e.path || '(root)'}: [${e.code}] ${e.message}`)
        .join('\n');
      return {
        content: [{
          type: 'text',
          text: `RCML validation failed. Call generate-email-rcml-doc to fix these errors:\n${errorList}`,
        }],
        isError: true,
      };
    }

    try {
      const req = {
        name: args.name,
        content: rcmlDoc,
      };

      const response = await ruleClient.templates.createEmailTemplate(req);
      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }],
      };
    } catch (err) {
      return {
        content: [{
          type: 'text',
          text: `Template creation failed: ${err instanceof Error ? err.message : String(err)}`,
        }],
        isError: true,
      };
    }
  });
}
