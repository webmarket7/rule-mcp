import { McpServer, RegisteredPrompt } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPrompt(server: McpServer): RegisteredPrompt {
  return server.registerPrompt('create-email-template', {
    title: 'Create Email Template',
    description:
      'Full workflow: fetch brand style → derive email theme → generate and validate RCML → ' +
      'publish template → render and return HTML. Provide a description of the email and ' +
      'optionally a brand style ID; Claude drives all tools automatically.',
    argsSchema: {
      description: z.string().describe('Free-form description of the email content and purpose.'),
      templateName: z.string().describe('Name to save the template under in Rule.'),
      brandStyleId: z.string().optional().describe(
        'Brand style ID or name. If omitted, the default brand style is used.'
      ),
    },
  }, (args) => {
    const brandStyleStep = args.brandStyleId
      ? `Call \`get-brand-style\` with \`id\` set to \`${args.brandStyleId}\`.`
      : 'Call `get-brand-style` with no arguments to fetch the default brand style.';

    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Create a Rule email template with the following details:

**Template name:** ${args.templateName}
**Description:** ${args.description}

Follow these steps in order:

1. Read the \`email-rcml://generation-guide\` resource — use it as your reference for all RCML structure and element rules throughout this workflow.
2. ${brandStyleStep}
3. Call \`brand-style-to-email-theme\` with the brand style JSON from step 2 to derive the email theme.
4. Using the generation guide from step 1 and the theme from step 3, generate an \`RcmlDocument\` JSON that matches the description above.
5. Call \`generate-email-rcml-doc\` with your RCML and the theme. If it returns validation errors, fix the RCML and call it again — repeat until you receive a valid document.
6. Call \`create-email-template\` with the validated RCML and the template name \`${args.templateName}\`. Note the returned template ID.
7. Call \`render-email-template\` with the template ID from step 6.
8. Present the rendered HTML to the user.`,
        },
      }],
    };
  });
}
