import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { applyTheme, safeValidateEmailTemplate, EmailThemeApplyError } from '@rulecom/sdk';
import type { RuleClient, RcmlDocument, EmailTheme } from '@rulecom/sdk';
import { inputSchemaShape } from './schemas.js';

export function registerTool(server: McpServer, _ruleClient: RuleClient): RegisteredTool {
  return server.registerTool('generate-email-rcml-doc', {
    title: 'Generate Email RCML Document',
    description:
      'Applies an EmailTheme to an RcmlDocument and validates the result. ' +
      'Before calling this tool, read the email-rcml://generation-guide resource for the ' +
      'full RCML element reference, ProseMirror content format, attribute values, and ' +
      'layout patterns. Generate an RcmlDocument JSON, then pass it here with the ' +
      'EmailTheme JSON. On success, returns the themed and validated RCML. On failure, ' +
      'returns structured validation errors — fix the RCML and call again to iterate. ' +
      'Once valid, call create-email-template to publish the template.',
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

    let theme: EmailTheme;
    try {
      theme = JSON.parse(args.theme) as EmailTheme;
    } catch {
      return {
        content: [{ type: 'text', text: 'Invalid theme: could not parse as JSON.' }],
        isError: true,
      };
    }

    let themedDoc: RcmlDocument;
    try {
      themedDoc = applyTheme(rcmlDoc, theme);
    } catch (err) {
      if (err instanceof EmailThemeApplyError) {
        return {
          content: [{ type: 'text', text: `Theme application failed: ${err.message}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: `Theme application failed: ${err instanceof Error ? err.message : String(err)}` }],
        isError: true,
      };
    }

    const result = safeValidateEmailTemplate(themedDoc);
    if (!result.success) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ valid: false, errors: result.errors }, null, 2),
        }],
      };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }],
    };
  });
}
